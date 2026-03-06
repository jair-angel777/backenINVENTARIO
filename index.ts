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
                imagen: body.imagen,
                proveedor_id: body.proveedor_id
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
                proveedor_id: body.proveedor_id,
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

// --- ROUTES PROVEEDORES ---

// GET /api/suppliers
app.get('/api/suppliers', async (req: Request, res: Response) => {
    try {
        const suppliers = await prisma.proveedores.findMany({
            orderBy: {
                fecha_creacion: 'desc'
            }
        });
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
});

// GET /api/suppliers/:id
app.get('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const supplier = await prisma.proveedores.findUnique({
            where: { id: id }
        });

        if (!supplier) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json(supplier);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
});

// POST /api/suppliers
app.post('/api/suppliers', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const supplier = await prisma.proveedores.create({
            data: {
                nombre: body.nombre,
                email: body.email,
                telefono: body.telefono,
                direccion: body.direccion,
                categoria: body.categoria,
                notas: body.notas
            }
        });
        res.status(201).json(supplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ error: 'Error al crear el proveedor' });
    }
});

// PATCH /api/suppliers/:id
app.patch('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const body = req.body;
        const supplier = await prisma.proveedores.update({
            where: { id: id },
            data: {
                nombre: body.nombre,
                email: body.email,
                telefono: body.telefono,
                direccion: body.direccion,
                categoria: body.categoria,
                notas: body.notas
            }
        });
        res.json(supplier);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
});

// DELETE /api/suppliers/:id
app.delete('/api/suppliers/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.proveedores.delete({
            where: { id: id }
        });
        res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
});

// --- ROUTES PEDIDOS (ORDERS) ---

// GET /api/orders
app.get('/api/orders', async (req: Request, res: Response) => {
    try {
        const orders = await prisma.orden_compra.findMany({
            include: {
                detalles: true
            },
            orderBy: {
                fecha: 'desc'
            }
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// POST /api/orders
app.post('/api/orders', async (req: Request, res: Response) => {
    try {
        const { proveedor_id, subtotal, igv, total, notas, detalles } = req.body;

        // Crear la orden y sus detalles en una transacción
        const newOrder = await prisma.orden_compra.create({
            data: {
                proveedor_id,
                subtotal: subtotal || 0,
                igv: igv || 0,
                total: total,
                notas,
                detalles: {
                    create: detalles.map((d: any) => ({
                        producto_id: d.producto_id,
                        nombre_producto: d.nombre_producto,
                        cantidad: d.cantidad,
                        costo_unitario: d.costo_unitario,
                        subtotal: d.subtotal
                    }))
                }
            },
            include: {
                detalles: true
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Error al crear el pedido. Revisa los logs del servidor.' });
    }
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { estado } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Obtener el pedido actual con sus detalles
            const order = await tx.orden_compra.findUnique({
                where: { id: id },
                include: { detalles: true }
            });

            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            // 2. Incrementar stock solo si el estado cambia a COMPLETADO y no lo estaba ya
            if (estado === 'COMPLETADO' && order.estado !== 'COMPLETADO') {
                for (const item of order.detalles) {
                    await tx.productos.update({
                        where: { id: item.producto_id },
                        data: {
                            stock: {
                                increment: item.cantidad
                            }
                        }
                    });
                }
            }

            // 3. Actualizar el estado del pedido
            return await tx.orden_compra.update({
                where: { id: id },
                data: {
                    estado: estado // COMPLETADO, PENDIENTE, CANCELADO
                }
            });
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message || 'Error al actualizar el estado del pedido' });
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

// TEMPORARY RESET ROUTE /api/reset-database
app.get('/api/reset-database', async (req: Request, res: Response) => {
    try {
        console.log('🧹 Iniciando limpieza de base de datos via API...');
        await prisma.detalle_orden.deleteMany();
        await prisma.orden_compra.deleteMany();
        await prisma.productos.deleteMany();
        await prisma.proveedores.deleteMany();
        res.json({ status: 'Success', message: 'Toda la base de datos ha sido limpiada.' });
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
