const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.camera.count();
    if (count > 0) {
        console.log('Cameras already exist. Skipping seed.');
        return;
    }

    const cameras = [
        { name: 'Main Entrance', floor: 'Ground Floor', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', isActive: true },
        { name: 'Parking Lot', floor: 'Ground Floor', streamUrl: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', isActive: true },
        { name: '1st Floor Hallway', floor: '1st Floor', streamUrl: 'http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8', isActive: false },
        { name: 'Rooftop Garden', floor: '3rd Floor', streamUrl: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8', isActive: true },
    ];

    for (const camera of cameras) {
        await prisma.camera.create({ data: camera });
    }

    console.log('Seed data for cameras created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
