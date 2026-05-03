import { ArticleStatus, PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      login: 'admin',
      password: 'admin123',
      role: Role.admin,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      login: 'viewer',
      password: 'viewer456',
      role: Role.viewer,
    },
  });

  const editor = await prisma.user.create({
    data: {
      login: 'editor',
      password: 'editor789',
      role: Role.editor,
    },
  });

  const organic = await prisma.category.create({
    data: {
      name: 'Organic chemistry',
      description: 'The study of carbon-based compounds',
    },
  });
  const inorganic = await prisma.category.create({
    data: {
      name: 'Inorganic chemistry',
      description: 'The study of minerals and metals',
    },
  });
  const analytical = await prisma.category.create({
    data: {
      name: 'Analytical chemistry',
      description:
        'The science of obtaining and processing information about the composition of matter',
    },
  });

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'catalysis' } }),
    prisma.tag.create({ data: { name: 'spectroscopy' } }),
    prisma.tag.create({ data: { name: 'chromatography' } }),
    prisma.tag.create({ data: { name: 'synthesis' } }),
    prisma.tag.create({ data: { name: 'biomolecules' } }),
  ]);

  const acs = await prisma.article.create({
    data: {
      title: 'ACS Catalysis',
      content: 'ACS Catalysis focuses on experimental and theoretical studies',
      status: ArticleStatus.published,
      authorId: admin.id,
      categoryId: inorganic.id,
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  const scienceDirectSpec = await prisma.article.create({
    data: {
      title: 'Spectroscopy',
      content: 'Spectroscopy—Principle, types, and applications',
      status: ArticleStatus.archived,
      authorId: editor.id,
      categoryId: analytical.id,
      tags: {
        connect: [{ id: tags[1].id }],
      },
    },
  });

  const scienceDirectChrom = await prisma.article.create({
    data: {
      title: 'Chromatography',
      content:
        'Current research approaches in downstream processing of pharmaceutically relevant proteins',
      status: ArticleStatus.published,
      authorId: admin.id,
      categoryId: analytical.id,
      tags: {
        connect: [{ id: tags[2].id }],
      },
    },
  });

  const joc = await prisma.article.create({
    data: {
      title: 'Synthesis',
      content: 'Total Synthesis of Triplinone F',
      status: ArticleStatus.draft,
      authorId: admin.id,
      categoryId: organic.id,
      tags: {
        connect: [{ id: tags[3].id }],
      },
    },
  });

  const scienceDirectBiomol = await prisma.article.create({
    data: {
      title: 'Biomolecule',
      content:
        'A CRISPR Technology and Biomolecule Production by Synthetic Biology Approach',
      status: ArticleStatus.draft,
      authorId: viewer.id,
      categoryId: organic.id,
      tags: {
        connect: [{ id: tags[4].id }],
      },
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        content:
          'What was the exact temperature ramp rate used during the calcination step?',
        authorId: editor.id,
        articleId: acs.id,
      },
      {
        content:
          'I noticed a lower yield when scaling this up to 10g; did you encounter any mass transfer issues?',
        authorId: viewer.id,
        articleId: joc.id,
      },
      {
        content:
          'Can you provide the raw data for the HPLC chromatograms? The resolution in Figure 3 is a bit low.',
        authorId: viewer.id,
        articleId: scienceDirectChrom.id,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
