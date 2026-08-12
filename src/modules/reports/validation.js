const { z } = require('zod');

const dateFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

module.exports = {
  dateFilterSchema
};
