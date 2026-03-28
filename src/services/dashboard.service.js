'use strict';

const DashboardModel = require('../models/dashboard.model');
const { paginate }   = require('../utils/helpers');

const DashboardService = {
  async getMetrics() {
    const [students, avgScore, certificates, assignments] = await Promise.all([
      DashboardModel.getTotalStudents(),
      DashboardModel.getAverageScore(),
      DashboardModel.getTotalCertificates(),
      DashboardModel.getTotalAssignments(),
    ]);

    return {
      total_students:     Number(students),
      average_score:      Number(avgScore),
      total_certificates: Number(certificates),
      total_assignments:  Number(assignments),
    };
  },

  async getLessonsHistory(query) {
    const { page, limit, offset } = paginate(query, 10);
    const [rows, total] = await Promise.all([
      DashboardModel.getLessonsHistory({ limit, offset }),
      DashboardModel.countPublishedCourses(),
    ]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: Number(total),
        total_pages: Math.ceil(Number(total) / limit),
      },
    };
  },
};

module.exports = DashboardService;
