import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: '*', // En un entorno real, restringe esto a http://localhost:3000 o el dominio de tu frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// --- ROUTES ---

// GET /api/products
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const products = await prisma.productos.findMany({
            orderBy: {
                fecha_creacion: 'desc'
            }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const product = await prisma.productos.findUnique({
            where: { id: id }
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// POST /api/products
app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const product = await prisma.productos.create({
            data: {
                nombre: body.nombre,
                categoria: body.categoria,
                precio: body.precio,
                costo: body.costo,
                stock: body.stock,
                stock_minimo: body.stock_minimo,
                sku: body.sku,
                imagen: body.imagen
            }
        });
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// PATCH /api/products/:id
app.patch('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body;
        const product = await prisma.productos.update({
            where: { id: id },
            data: {
                nombre: body.nombre,
                categoria: body.categoria,
                precio: body.precio,
                costo: body.costo,
                stock: body.stock,
                stock_minimo: body.stock_minimo,
                sku: body.sku,
                imagen: body.imagen,
                fecha_actualizacion: new Date()
            }
        });
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.productos.delete({
            where: { id: id }
        });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// TEST ROUTE /api/debug/test-db
app.get('/api/debug/test-db', async (req: Request, res: Response) => {
    try {
        const count = await prisma.productos.count();
        res.json({ status: 'Connected', message: `Database connected. ${count} products found.` });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
    });
}
