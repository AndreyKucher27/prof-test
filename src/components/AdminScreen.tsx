import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  checkIsCurrentUserAdmin,
  getCurrentAdminSession,
  signInAdmin,
  signOutAdmin,
} from "../services/adminAuth";

import {
  getAdminResults,
  type AdminTestResult,
} from "../services/getAdminResults";

import { downloadAdminResultsCsv } from "../services/downloadAdminResultsCsv";

type LevelFilter = "all" | "bachelor" | "master";

function formatLevel(level: "bachelor" | "master") {
  return level === "bachelor" ? "Бакалавриат" : "Магистратура";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

function AdminScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [results, setResults] = useState<AdminTestResult[]>([]);

  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedResult, setSelectedResult] =
    useState<AdminTestResult | null>(null);

  async function loadResults() {
    setIsLoadingResults(true);

    const loadedResults = await getAdminResults();

    setResults(loadedResults);
    setIsLoadingResults(false);
  }

  useEffect(() => {
    async function checkSession() {
      const session = await getCurrentAdminSession();

      if (!session) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsCheckingSession(false);
        return;
      }

      const adminStatus = await checkIsCurrentUserAdmin();

      setIsAuthenticated(true);
      setIsAdmin(adminStatus);
      setIsCheckingSession(false);
    }

    checkSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }

    loadResults();
  }, [isAuthenticated, isAdmin]);

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return results.filter((result) => {
      const matchesLevel =
        levelFilter === "all" || result.education_level === levelFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        result.top_program_name?.toLowerCase().includes(normalizedSearch);

      return matchesLevel && matchesSearch;
    });
  }, [results, levelFilter, searchQuery]);

  const lastResult = filteredResults[0] ?? null;

  const stats = useMemo(() => {
    const total = filteredResults.length;

    const bachelorCount = filteredResults.filter(
      (result) => result.education_level === "bachelor"
    ).length;

    const masterCount = filteredResults.filter(
      (result) => result.education_level === "master"
    ).length;

    const percents = filteredResults
      .map((result) => result.top_program_percent)
      .filter((percent): percent is number => typeof percent === "number");

    const averagePercent =
      percents.length > 0
        ? Math.round(
            percents.reduce((sum, percent) => sum + percent, 0) /
              percents.length
          )
        : 0;

    const programCounts = filteredResults.reduce<Record<string, number>>(
      (acc, result) => {
        if (!result.top_program_name) {
          return acc;
        }

        acc[result.top_program_name] = (acc[result.top_program_name] ?? 0) + 1;

        return acc;
      },
      {}
    );

    const mostPopularProgram =
      Object.entries(programCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Недостаточно данных";

    return {
      total,
      bachelorCount,
      masterCount,
      averagePercent,
      mostPopularProgram,
    };
  }, [filteredResults]);

  const levelChartData = useMemo(() => {
    return [
      {
        name: "Бакалавриат",
        value: stats.bachelorCount,
      },
      {
        name: "Магистратура",
        value: stats.masterCount,
      },
    ].filter((item) => item.value > 0);
  }, [stats.bachelorCount, stats.masterCount]);

  const topProgramsChartData = useMemo(() => {
    const programCounts = filteredResults.reduce<Record<string, number>>(
      (acc, result) => {
        if (!result.top_program_name) {
          return acc;
        }

        acc[result.top_program_name] = (acc[result.top_program_name] ?? 0) + 1;

        return acc;
      },
      {}
    );

    return Object.entries(programCounts)
      .map(([name, count]) => ({
        name,
        count,
        shortName: name.length > 34 ? `${name.slice(0, 34)}...` : name,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredResults]);

  const averageInterestChartData = useMemo(() => {
    const interestMap = filteredResults.reduce<
      Record<string, { total: number; count: number }>
    >((acc, result) => {
      result.interest_profile.forEach((interest) => {
        if (!acc[interest.name]) {
          acc[interest.name] = {
            total: 0,
            count: 0,
          };
        }

        acc[interest.name].total += interest.percent;
        acc[interest.name].count += 1;
      });

      return acc;
    }, {});

    return Object.entries(interestMap)
      .map(([name, data]) => ({
        name,
        percent: Math.round(data.total / data.count),
        shortName: name.length > 22 ? `${name.slice(0, 22)}...` : name,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [filteredResults]);

  const resetFilters = () => {
    setLevelFilter("all");
    setSearchQuery("");
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAuthError(null);

    const { user, error } = await signInAdmin(email, password);

    if (error || !user) {
      setAuthError("Не удалось войти. Проверьте email и пароль.");
      return;
    }

    const adminStatus = await checkIsCurrentUserAdmin();

    if (!adminStatus) {
      setIsAuthenticated(true);
      setIsAdmin(false);
      setAuthError(null);
      return;
    }

    setIsAuthenticated(true);
    setIsAdmin(true);
    setEmail("");
    setPassword("");
  };

  const handleLogout = async () => {
    await signOutAdmin();

    setIsAuthenticated(false);
    setIsAdmin(false);
    setResults([]);
    setSelectedResult(null);
  };

  if (isCheckingSession) {
    return (
      <div className="container admin-screen">
        <div className="screen-header">
          <div className="badge">Админ-панель</div>

          <h1 className="title">Проверяем сессию</h1>

          <p className="subtitle">
            Подождите, система проверяет авторизацию администратора.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container admin-screen">
        <div className="screen-header">
          <div className="badge">Админ-панель</div>

          <h1 className="title">Вход администратора</h1>

          <p className="subtitle">
            Введите email и пароль администратора, чтобы открыть статистику
            прохождений теста.
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {authError && <p className="admin-error">{authError}</p>}

          <button className="button" type="submit">
            Войти
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container admin-screen">
        <div className="screen-header">
          <div className="badge">Админ-панель</div>

          <h1 className="title">Нет доступа</h1>

          <p className="subtitle">
            Вы вошли в систему, но ваш email не добавлен в список
            администраторов.
          </p>
        </div>

        <button className="button secondary" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="container admin-screen">
      <div className="admin-top">
        <div>
          <div className="badge">Админ-панель</div>

          <h1 className="title">Статистика прохождений</h1>

          <p className="subtitle">
            Здесь отображаются сохранённые результаты профориентационного
            тестирования.
          </p>
        </div>

        <button className="admin-logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          <button
            className={levelFilter === "all" ? "active" : ""}
            onClick={() => setLevelFilter("all")}
          >
            Все
          </button>

          <button
            className={levelFilter === "bachelor" ? "active" : ""}
            onClick={() => setLevelFilter("bachelor")}
          >
            Бакалавриат
          </button>

          <button
            className={levelFilter === "master" ? "active" : ""}
            onClick={() => setLevelFilter("master")}
          >
            Магистратура
          </button>
        </div>

        <input
          className="admin-search"
          type="text"
          placeholder="Поиск по профилю..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <button
          className="admin-reset"
          onClick={resetFilters}
          disabled={levelFilter === "all" && searchQuery.trim() === ""}
        >
          Сбросить
        </button>

        <button className="admin-refresh" onClick={loadResults}>
          Обновить
        </button>

        <button
          className="admin-export"
          onClick={() => downloadAdminResultsCsv(filteredResults)}
          disabled={filteredResults.length === 0}
        >
          Скачать CSV
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Всего прохождений</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Бакалавриат</span>
          <strong>{stats.bachelorCount}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Магистратура</span>
          <strong>{stats.masterCount}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Среднее совпадение</span>
          <strong>{stats.averagePercent}%</strong>
        </div>
      </div>

      <div className="admin-popular-card">
        <span>Самый частый рекомендуемый профиль</span>
        <strong>{stats.mostPopularProgram}</strong>
      </div>

      <div className="admin-last-result-card">
        <div>
          <span>Последнее прохождение</span>

          {lastResult ? (
            <>
              <strong>{lastResult.top_program_name ?? "Профиль не указан"}</strong>

              <p>
                {formatDate(lastResult.created_at)} ·{" "}
                {formatLevel(lastResult.education_level)}
                {typeof lastResult.top_program_percent === "number"
                  ? ` · ${lastResult.top_program_percent}%`
                  : ""}
              </p>
            </>
          ) : (
            <>
              <strong>Нет данных</strong>
              <p>Пока нет результатов по выбранным фильтрам.</p>
            </>
          )}
        </div>

        {lastResult && (
          <button
            className="admin-details-button"
            onClick={() => setSelectedResult(lastResult)}
          >
            Подробнее
          </button>
        )}
      </div>

      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <span>Распределение</span>

            <h2>Уровни поступления</h2>

            <p>Соотношение прохождений бакалавриата и магистратуры.</p>
          </div>

          {levelChartData.length === 0 ? (
            <p className="admin-muted">Недостаточно данных для диаграммы.</p>
          ) : (
            <div className="admin-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {levelChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={index === 0 ? "#2563eb" : "#7c3aed"}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="admin-chart-legend">
            <span>
              <i className="legend-dot blue" />
              Бакалавриат
            </span>

            <span>
              <i className="legend-dot purple" />
              Магистратура
            </span>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <span>Популярность</span>

            <h2>Топ-5 профилей</h2>

            <p>Профили, которые чаще всего становятся лучшей рекомендацией.</p>
          </div>

          {topProgramsChartData.length === 0 ? (
            <p className="admin-muted">Недостаточно данных для графика.</p>
          ) : (
            <div className="admin-chart-wrapper bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProgramsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                  <XAxis type="number" allowDecimals={false} />

                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={180}
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                      fontWeight: 700,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => [`${value}`, "Количество"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.name ?? ""
                    }
                  />

                  <Bar
                    dataKey="count"
                    radius={[0, 10, 10, 0]}
                    fill="#2563eb"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="admin-wide-chart-card">
        <div className="admin-chart-header">
          <span>Интересы</span>

          <h2>Средний профиль интересов</h2>

          <p>
            Средние значения интересов пользователей по результатам сохранённых
            прохождений.
          </p>
        </div>

        {averageInterestChartData.length === 0 ? (
          <p className="admin-muted">Недостаточно данных для графика.</p>
        ) : (
          <div className="admin-chart-wrapper interest-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averageInterestChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="shortName"
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                    fontWeight: 700,
                  }}
                />

                <YAxis domain={[0, 100]} />

                <Tooltip
                  formatter={(value) => [`${value}%`, "Среднее значение"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.name ?? ""
                  }
                />

                <Bar
                  dataKey="percent"
                  radius={[10, 10, 0, 0]}
                  fill="#7c3aed"
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="admin-table-section">
        <h2>Последние результаты</h2>

        {isLoadingResults ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">○</div>

            <h3>Загружаем результаты</h3>

            <p>Подождите, данные загружаются из базы Supabase.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">!</div>

            <h3>Результаты не найдены</h3>

            <p>
              По выбранным фильтрам нет сохранённых прохождений. Попробуйте
              изменить уровень подготовки, очистить поиск или обновить данные.
            </p>

            <button className="admin-reset empty-reset" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Уровень</th>
                  <th>Лучший профиль</th>
                  <th>Совпадение</th>
                  <th>Детали</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>{formatDate(result.created_at)}</td>
                    <td>{formatLevel(result.education_level)}</td>
                    <td>{result.top_program_name ?? "—"}</td>
                    <td>
                      {typeof result.top_program_percent === "number"
                        ? `${result.top_program_percent}%`
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="admin-details-button"
                        onClick={() => setSelectedResult(result)}
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResult && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <button
              className="admin-modal-close"
              onClick={() => setSelectedResult(null)}
            >
              ×
            </button>

            <div className="admin-modal-header">
              <span>{formatLevel(selectedResult.education_level)}</span>

              <h2>Подробности результата</h2>

              <p>{formatDate(selectedResult.created_at)}</p>
            </div>

            <div className="admin-modal-section">
              <h3>Топ рекомендаций</h3>

              <div className="admin-detail-results">
                {selectedResult.results.map((result, index) => (
                  <div className="admin-detail-card" key={result.name}>
                    <div>
                      <strong>
                        {index + 1}. {result.name}
                      </strong>

                      <p>{result.description}</p>
                    </div>

                    <span>{result.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modal-section">
              <h3>Профиль интересов</h3>

              <div className="admin-interest-grid">
                {selectedResult.interest_profile.map((interest) => (
                  <div className="admin-interest-item" key={interest.name}>
                    <span>{interest.name}</span>

                    <strong>{interest.percent}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modal-section">
              <h3>Ответы пользователя</h3>

              <div className="admin-answers-grid">
                {selectedResult.answers.map((answer, index) => (
                  <div className="admin-answer-item" key={index}>
                    <span>Вопрос {index + 1}</span>

                    <strong>{answer}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminScreen;
