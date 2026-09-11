import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function validateProduct({ nombre, precio, stock }) {
  if (typeof nombre !== 'string' || !nombre.trim()) {
    return 'El nombre es obligatorio';
  }

  if (nombre.trim().length > 100) {
    return 'El nombre no puede superar los 100 caracteres';
  }

  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0) {
    return 'El precio debe ser un número mayor o igual a 0';
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return 'El stock debe ser un número entero mayor o igual a 0';
  }

  return null;
}

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, precio::float8 AS precio, stock, created_at FROM products ORDER BY id ASC'
    );
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Error listando productos:', error);
    res.status(500).json({ message: 'No se pudieron consultar los productos' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'El id del producto no es válido' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, precio::float8 AS precio, stock, created_at FROM products WHERE id = $1',
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Error consultando producto:', error);
    res.status(500).json({ message: 'No se pudo consultar el producto' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, precio, stock } = req.body;
  const validationError = validateProduct({ nombre, precio, stock });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (nombre, precio, stock)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, precio::float8 AS precio, stock, created_at`,
      [nombre.trim(), precio, stock]
    );
    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'No se pudo crear el producto' });
  }
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'El id del producto no es válido' });
  }

  const { nombre, precio, stock } = req.body;
  const validationError = validateProduct({ nombre, precio, stock });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET nombre = $1, precio = $2, stock = $3
       WHERE id = $4
       RETURNING id, nombre, precio::float8 AS precio, stock, created_at`,
      [nombre.trim(), precio, stock, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'No se pudo actualizar el producto' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'El id del producto no es válido' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'No se pudo eliminar el producto' });
  }
});

export default router;