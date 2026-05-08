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
      content:
        'ACS Catalysis focuses on experimental and theoretical studies. ACS Catalysis is dedicated to publishing original research on heterogeneous catalysis, homogeneous catalysis, and biocatalysis. ACS Catalysis includes both experimental and theoretical research on molecules, macromolecules and materials that are catalytic in nature, that is, they exhibit catalytic turnover.',
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
      content:
        'Spectroscopy—Principle, types, and applications. Spectroscopy is the study of the interaction between matter and electromagnetic radiation. Spectroscopy is the study of how light interacts with matter. We can use spectroscopy to determine the structure and functional groups in organic compounds. It is the study of the absorption and emission of light and other radiation by matter, as related to the dependence of these processes on the wavelength of the radiation. More recently, the definition has been expanded to include the study of the interactions between particles such as electrons, protons, and ions, as well as their interaction with other particles as a function of their collision energy. Spectroscopy pertains to the dispersion of an object’s light into its component colors (i.e., energies). By performing this dissection and analysis of an object’s light, astronomers can infer the physical properties of that object (such as temperature, mass, luminosity, and composition). In this chapter, we have covered the detailed study of different spectroscopy techniques, their principles, applications, and safety protocols associated with their use.',
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
        'Current research approaches in downstream processing of pharmaceutically relevant proteins. Biopharmaceuticals and their production are on the rise. They are needed to treat and to prevent multiple diseases. Therefore, an urgent need for process intensification in downstream processing (DSP) has been identified to produce biopharmaceuticals more efficiently. The DSP currently accounts for the majority of production costs of pharmaceutically relevant proteins. This short review gathers essential research over the past 3 years that addresses novel solutions to overcome this bottleneck. The overview includes promising studies in the fields of chromatography, aqueous two-phase systems, precipitation, crystallization, magnetic separation, and filtration for the purification of pharmaceutically relevant proteins.',
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
      content:
        'Total Synthesis of Triplinone F. The first total synthesis of triplinone F, along with its C11 epimer, has been executed to establish, inter alia, the stereochemistry of C11 and its complete absolute configuration. The terminal styrene unit was added by cross-metathesis, whereby 1,3-diol units on either side of the central olefin were taken from malic acid enantiomers and coupled by a Yamaguchi alkyne–epoxide opening protocol. The C11 stereochemistry was manipulated by Noyori asymmetric ynone reduction. The Z-selective reduction of alkynoate and acid-catalyzed lactonization forged the right-hand-side 5,6-dihydro-δ-pyrone unit.',
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
        'A CRISPR Technology and Biomolecule Production by Synthetic Biology Approach. Biomolecules are an organic molecule that includes carbohydrates, protein, lipids, and nucleic acids. They are important for the survival of living cells. Some of valuable biomolecules have huge demand, which cannot be fulfilled from their renewable resources. Microbes have been used as a cell factory for their alternative production. The strategies adopted for engineering a high yielding biomolecule producing microbe are overexpression, knockout, and activation of gene. With the advent of synthetic biology and clustered regularly interspaced short palindromic repeats (CRISPR)/Cas tool, genetic manipulation has become easier and is a less labor-intensive process. Engineering of metabolic pathway faces multiple challenges such as in metabolic flux imbalances, presence of nondesirable enzymes, and leaky gene expression can be solved by assembling the best biological parts available in nature. These biological parts can be used to construct a novel pathway for the production of the desired biomolecule without altering the native functions of the host. Another emerging area known as synthetic genomics has opened up possibilities of creating a synthetic genome for producing an artificial cell. Similarly, an artificial genome can be customized to engineer microbes for specific biomolecule production while removing nonessential function of the cell. This chapter describes the application of synthetic biology and CRISPR/Cas system for the production of important valuable biomolecules. The recent tools for the engineering of microbes are also discussed in the context of biomolecule production. The chapter overall produces a comprehensive work in the field of biomolecules production by applying diverse approaches of synthetic biology and CRISPR/Cas system.',
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
      {
        content:
          'How can economic considerations influence software architecture decisions and the long-term sustainability of a software system?',
        authorId: editor.id,
        articleId: scienceDirectSpec.id,
      },
      {
        content:
          'How does CRISPR/Cas technology improve biomolecule production in microorganisms?',
        authorId: editor.id,
        articleId: scienceDirectBiomol.id,
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
