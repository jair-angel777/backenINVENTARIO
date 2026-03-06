import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Iniciando limpieza de base de datos...');

    try {
        // El orden es importante por las relaciones (FK)
        console.log('- Eliminando detalles de órdenes...');
        await prisma.detalle_orden.deleteMany();

        console.log('- Eliminando órdenes de compra...');
        await prisma.orden_compra.deleteMany();

        console.log('- Eliminando productos...');
        await prisma.productos.deleteMany();

        console.log('- Eliminando proveedores...');
        await prisma.proveedores.deleteMany();

        console.log('✅ Base de datos limpia con éxito.');
    } catch (error) {
        console.error('❌ Error al limpiar la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
