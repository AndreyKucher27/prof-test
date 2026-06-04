import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { InterestProfile } from "../types/interest";

type InterestRadarChartProps = {
  interestProfile: InterestProfile[];
};

function InterestRadarChart({ interestProfile }: InterestRadarChartProps) {
  const radarRef = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(radarRef, {
    once: true,
    amount: 0.35,
  });

  const chartData = interestProfile.map((interest) => ({
    name: interest.name,
    value: isInView ? interest.percent : 0,
  }));

  const sortedInterestProfile = [...interestProfile].sort(
    (a, b) => b.percent - a.percent
  );

  return (
    <div className="radar-card simple-radar-card" ref={radarRef}>
      <div className="radar-header simple-radar-header">
        <div>
          <span className="panel-kicker panel-kicker-compare">
            Профиль интересов
          </span>

          <h2>Ваш профиль интересов</h2>

          <p className="radar-description">
            Диаграмма показывает, какие направления и области оказались для вас
            наиболее выраженными по итогам прохождения теста.
          </p>
        </div>
      </div>

      <div className="radar-wrapper simple-radar-wrapper desktop-radar-chart">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />

            <PolarAngleAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fill: "#64748b",
                fontWeight: 700,
              }}
            />

            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
              }}
            />

            <Radar
              name="Ваш профиль"
              dataKey="value"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.28}
              strokeWidth={3}
              isAnimationActive
              animationBegin={120}
              animationDuration={1100}
              animationEasing="ease-out"
            />

            <Tooltip formatter={(value) => [`${value}%`, "Интерес"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mobile-interest-profile">
        {sortedInterestProfile.map((interest, index) => (
          <motion.div
            className="mobile-interest-row"
            key={interest.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut",
            }}
          >
            <div className="mobile-interest-top">
              <span>{interest.name}</span>
              <strong>{interest.percent}%</strong>
            </div>

            <div className="mobile-interest-bar">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${interest.percent}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 0.8,
                  delay: 0.1 + index * 0.05,
                  ease: "easeOut",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="radar-simple-legend desktop-radar-legend">
        <span>
          <i />
          Ваш профиль интересов
        </span>
      </div>
    </div>
  );
}

export default InterestRadarChart;