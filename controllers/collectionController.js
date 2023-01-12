import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const prismaDefaultError = (error, res) => {
  //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.json(error.message);
  } else {
    res.status(500).json({ message: "Unexpected error", error });
  }
};

//* COLLECTIONS
//? For use on 'Main Collection page' i.e. Fine Jewelry or Demi Fine Jewelry
//? @url_frontend & backend - '/products/main/:main_jewelry_title'
const getMainCollection = async (req, res) => {
  let { main_jewelry_title } = req.params;
  const jewelryTitle = main_jewelry_title.split("-").join(" ");

  try {
    //? STEP #01 - Find Main Jewelry Type
    // Find the Main Jewelry type populated with ALL 'sub-collections'
    const mainJewelryFound = await prisma.mainCollection.findUnique({
      where: {
        name: jewelryTitle,
      },
      select: {
        id: true,
        name: true,
        description: true,
        collections: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!mainJewelryFound) {
      return res.json({
        status: "fail",
        message: "Main Jewelry Type not found.",
      });
    }

    //? STEP #02 - Find 'ALL' Categories and products under them
    const allCategories = await prisma.category.findMany();

    if (!allCategories) {
      return res.json({ status: "fail", message: "Categories not found" });
    }

    //? STEP #03 - Send 'mainJewelry' and 'all categories'
    res.json({ mainJewelry: mainJewelryFound, category: allCategories });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? For use on 'Sub Collection page' i.e. Aurora, Daria, etc
//? @url_backend - '/api/collections/:collection_name'
//? For use on '/collections/:collection_name' frontend page
const getSubCollection = async (req, res) => {
  // Get 'collectionName' from Request params and search in DB.
  let { collection_name } = req.params;
  const collectionName = collection_name.split("-").join(" ") || "";

  try {
    const foundCollection = await prisma.collection.findUnique({
      where: {
        name: collectionName,
      },
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        products: {
          orderBy: {
            product_price: "desc",
          },
          select: {
            product_id: true,
            product_images: true,
            product_title: true,
            product_price: true,
            product_types: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const foundCategories = await prisma.category.findMany({
      select: {
        name: true,
      },
    });

    if (!foundCollection)
      return res.json({ status: "fail", message: "Collection not found." });

    if (!foundCategories)
      return res.json({ status: "fail", message: "Categories not found" });

    res.json({ collection: foundCollection, categories: foundCategories });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? For use on '/collections' page
const getAllCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        image: true,
        products: {
          orderBy: {
            product_price: "desc",
          },
          select: {
            product_id: true,
            product_images: true,
            product_title: true,
            product_price: true,
          },
        },
      },
    });
    if (!collections)
      return res.json({ status: "fail", message: "Collections not found." });
    res.json(collections);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//* For usage on frontend '/products/browse'
//? This accepts two inputs: 'main collection name', 'collection name', 'type'
const browseMainCollection = async (req, res) => {
  const { mainCollectionName, collectionName, type } = req.body;

  let mainCollectionNameModified =
    mainCollectionName && mainCollectionName.length > 3
      ? mainCollectionName.trim()
      : "";

  let collectionNameModified =
    collectionName && collectionName.length >= 3 ? collectionName.trim() : "";

  let typeModified = type && type.length >= 3 ? type.trim() : "";

  if (mainCollectionNameModified === "all" || !mainCollectionNameModified)
    mainCollectionNameModified = undefined;
  const finalMainCollectionName = mainCollectionNameModified;

  if (collectionNameModified === "all" || !collectionNameModified)
    collectionNameModified = undefined;
  const finalCollectionName = collectionNameModified;

  if (typeModified === "all" || !typeModified) typeModified = undefined;
  const finalType = typeModified;

  try {
    const result = await prisma.mainCollection.findMany({
      where: {
        name: {
          search: mainCollectionName,
        },
      },
      // select: {
      //   id: true,
      //   name: true,
      //   description: true,
      //   image: true,
      //   collections: {
      //     where: {
      //       name: {
      //         search: finalCollectionName,
      //       },
      //     },
      //     select: {
      //       id: true,
      //       name: true,
      //       products: {
      //         where: {
      //           product_title: {
      //             search: finalType,
      //           },
      //           product_types: {
      //             search: finalType,
      //           },
      //         },
      //         select: {
      //           product_id: true,
      //           product_title: true,
      //           product_price: true,
      //           product_types: true,
      //           product_images: true,
      //         },
      //       },
      //     },
      //   },
      // },
    });

    // const result = await prisma.mainCollection.findMany({
    //   where: {
    //     name: {
    //       search: finalMainCollectionName,
    //     },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     description: true,
    //     image: true,
    //     collections: {
    //       where: {
    //         name: {
    //           search: finalCollectionName,
    //         },
    //       },
    //       select: {
    //         id: true,
    //         name: true,
    //         products: {
    //           where: {
    //             product_title: {
    //               search: finalType,
    //             },
    //             product_types: {
    //               search: finalType,
    //             },
    //           },
    //           select: {
    //             product_id: true,
    //             product_title: true,
    //             product_price: true,
    //             product_types: true,
    //             product_images: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    return res.json(result);

    // Filter out 'main collection'
    const mainCollectionResult = result.filter(
      (mainCol) => mainCol.name === mainCollectionNameModified
    );

    // Filter out sub-collection (e.g. Aurora) and get 'aurora' collection for example
    let foundCollection = [];
    if (collectionNameModified) {
      for (let eachMainCol of mainCollectionResult) {
        foundCollection = eachMainCol.collections.find(
          (eachColl) => eachColl.name === collectionNameModified
        );
      }
    }

    let finalData = [];
    finalData = foundCollection.products.filter(
      (eachProduct) => eachProduct.product_types === typeModified
    );

    if (!foundCollection || finalData.length === 0) {
      return res.json({ status: "fail", message: "No results found" });
    }

    res.json(finalData);
  } catch (error) {
    console.log(error);
    prismaDefaultError(error, res);
  }
};

export {
  getMainCollection,
  getSubCollection,
  getAllCollections,
  browseMainCollection,
};
