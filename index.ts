import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Seed inicial para el administrador
async function ensureAdmin() {
    try {
        const admin = await prisma.usuario.findUnique({
            where: { username: 'gerente' }
        });
        if (!admin) {
            await prisma.usuario.create({
                data: {
                    username: 'gerente',
                    password: '123',
                    rol: 'GERENTE'
                }
            });
            console.log('🛡️ Usuario administrador autogenerado: gerente/123');
        }
    } catch (e) {
        console.error('Error en seeding:', e);
    }
}
// eliminate top-level call to ensureAdmin();

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// --- API ROUTER ---
const api = Router();

// EMPLEADOS
api.get('/employees', async (req: Request, res: Response) => {
    try {
        const employees = await prisma.empleado.findMany({ orderBy: { nombre: 'asc' } });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleados' });
    }
});

api.post('/employees', async (req: Request, res: Response) => {
    try {
        const employee = await prisma.empleado.create({ data: req.body });
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear empleado' });
    }
});

api.patch('/employees/:id', async (req: Request, res: Response) => {
    try {
        const employee = await prisma.empleado.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar empleado' });
    }
});

api.delete('/employees/:id', async (req: Request, res: Response) => {
    try {
        await prisma.empleado.delete({ where: { id: req.params.id } });
        res.json({ message: 'Empleado eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar empleado' });
    }
});

// USUARIOS
api.get('/users', async (req: Request, res: Response) => {
    try {
        await ensureAdmin(); // Asegurar adminsitador antes de listar
        const users = await prisma.usuario.findMany({
            select: { id: true, username: true, rol: true, empleado_id: true, fecha_creacion: true, ultimo_acceso: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

api.post('/users', async (req: Request, res: Response) => {
    try {
        const user = await prisma.usuario.create({ data: req.body });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

api.patch('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await prisma.usuario.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

api.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        await prisma.usuario.delete({ where: { id: req.params.id } });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// AUTH
api.post('/auth/login', async (req: Request, res: Response) => {
    try {
        await ensureAdmin(); // Asegurar administrador justo antes de validar
        const { username, password } = req.body;

        // Buscar el usuario en la base de datos
        const user = await prisma.usuario.findUnique({
            where: { username: username }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Éxito: Retornar info básica
        res.json({
            id: user.id,
            username: user.username,
            rol: user.rol,
            empleado_id: user.empleado_id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error interno del servidor during login' });
    }
});

// PRODUCTOS
api.get('/products', async (req: Request, res: Response) => {
    try {
        const products = await prisma.productos.findMany({ orderBy: { fecha_creacion: 'desc' } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

api.get('/products/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.productos.findUnique({ where: { id: req.params.id } });
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

api.post('/products', async (req: Request, res: Response) => {
    try {
        const product = await prisma.productos.create({ data: req.body });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

api.patch('/products/:id', async (req: Request, res: Response) => {
    try {
        const product = await prisma.productos.update({
            where: { id: req.params.id },
            data: { ...req.body, fecha_actualizacion: new Date() }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

api.delete('/products/:id', async (req: Request, res: Response) => {
    try {
        await prisma.productos.delete({ where: { id: req.params.id } });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// PROVEEDORES
api.get('/suppliers', async (req: Request, res: Response) => {
    try {
        const suppliers = await prisma.proveedores.findMany({ orderBy: { fecha_creacion: 'desc' } });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

api.post('/suppliers', async (req: Request, res: Response) => {
    try {
        const supplier = await prisma.proveedores.create({ data: req.body });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
});

api.patch('/suppliers/:id', async (req: Request, res: Response) => {
    try {
        const supplier = await prisma.proveedores.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});

api.delete('/suppliers/:id', async (req: Request, res: Response) => {
    try {
        await prisma.proveedores.delete({ where: { id: req.params.id } });
        res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
});

// PEDIDOS
api.get('/orders', async (req: Request, res: Response) => {
    try {
        const orders = await prisma.orden_compra.findMany({ include: { detalles: true }, orderBy: { fecha: 'desc' } });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

api.post('/orders', async (req: Request, res: Response) => {
    try {
        const { proveedor_id, subtotal, igv, total, notas, detalles } = req.body;
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
            include: { detalles: true }
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

api.patch('/orders/:id/status', async (req: Request, res: Response) => {
    try {
        const { estado } = req.body;
        const result = await prisma.$transaction(async (tx: any) => {
            const order = await tx.orden_compra.findUnique({ where: { id: req.params.id }, include: { detalles: true } });
            if (!order) throw new Error('Pedido no encontrado');
            if (estado === 'COMPLETADO' && order.estado !== 'COMPLETADO') {
                for (const item of order.detalles) {
                    await tx.productos.update({
                        where: { id: item.producto_id },
                        data: { stock: { increment: item.cantidad } }
                    });
                }
            }
            return await tx.orden_compra.update({ where: { id: req.params.id }, data: { estado } });
        });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DEBUG
api.get('/debug/test-db', async (req: Request, res: Response) => {
    try {
        const count = await prisma.productos.count();
        res.json({ status: 'Connected', message: `Database connected. ${count} products found.` });
    } catch (error: any) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

// MOUNT ROUTER
// Se monta en /api para Vercel y en / para fallback
app.use('/api', api);
app.use('/', api);

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
}
