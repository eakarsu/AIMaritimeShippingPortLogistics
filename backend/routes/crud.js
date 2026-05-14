const pool = require('../db');

function createCrudRouter(tableName, columns) {
  const router = require('express').Router();

  // GET all with optional pagination (?page=1&limit=50)
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || null;
      const limit = parseInt(req.query.limit) || null;

      if (page && limit) {
        const offset = (page - 1) * limit;
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);
        const result = await pool.query(
          `SELECT * FROM ${tableName} ORDER BY id DESC LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        return res.json({
          data: result.rows,
          pagination: { page, limit, total, totalPages },
        });
      }

      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id DESC`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const cols = columns.filter(c => c !== 'id');
      const vals = cols.map(c => req.body[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        vals
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const cols = columns.filter(c => c !== 'id');
      const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const vals = cols.map(c => req.body[c]);
      vals.push(req.params.id);
      const result = await pool.query(
        `UPDATE ${tableName} SET ${sets} WHERE id = $${vals.length} RETURNING *`,
        vals
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
