import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "cloudinary";

const prismaDefaultError = (error, res) => {
  //? Unique way of checking for errors using 'Prisma'. Check 'Handling Errors' in Prisma Docs.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.json(error.message);
  } else {
    res.status(500).json({ message: "Unexpected error", error });
  }
};

//* MAIN-COLLECTION CONTROLLERS (E.g. Fine Jewelry, Demi Fine)
const getAllMainCollections = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const mainCollections = await prisma.mainCollection.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!mainCollections)
      return res.json({
        status: "fail",
        message: "No Main Collections found.",
      });
    res.json(mainCollections);
  } catch (error) {
    console.log(error);
    prismaDefaultError(error, res);
  }
};

// const getAllMainCollections = async (req, res) => {
//   //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
//   try {
//     const mainCollections = await prisma.mainCollection.findMany({
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         collections: {
//           select: {
//             id: true,
//             name: true,
//             products: {
//               select: {
//                 product_id: true,
//                 product_title: true,
//                 product_price: true,
//                 product_types: true,
//                 product_images: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     if (!mainCollections)
//       return res.json({
//         status: "fail",
//         message: "No Main Collections found.",
//       });
//     res.json(mainCollections);
//   } catch (error) {
//     console.log(error);
//     prismaDefaultError(error, res);
//   }
// };

const getMainCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = req.params.id;
  try {
    const mainCollection = await prisma.mainCollection.findUnique({
      where: {
        id: Number(id),
      },
    });
    // If Main Collection DOES NOT exist
    if (!mainCollection)
      return res.json({
        status: "fail",
        message: "Main Collection does not exist.",
      });

    // If Main Collection Exists, send as response:
    res.json(mainCollection);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const createMainCollection = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const { name, status, description, image } = req.body;

  try {
    const newMainCollection = await prisma.mainCollection.create({
      data: {
        name,
        status,
        description,
        image,
      },
    });

    if (!newMainCollection)
      return res.json({
        status: "fail",
        message: "Failed to create collection!",
      });

    res.json({
      status: "success",
      message: "Collection created successfully!",
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const updateMainCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  const { name, description, status, image } = req.body;

  try {
    //? First search if main collection exists:
    const mainCollection = await prisma.mainCollection.findUnique({
      where: {
        id: id,
      },
    });

    if (mainCollection) {
      const updatedMainCollection = await prisma.mainCollection.update({
        where: {
          id: id,
        },
        data: {
          name: name || mainCollection.name,
          status: status || mainCollection.status,
          description: description || mainCollection.description,
          image: image || mainCollection.image,
        },
      });

      res.json({
        status: "success",
        message: "Main Collection updated successfully!",
      });
    } else {
      // If item does not exist, return error based response
      res.status(404).json({
        status: "fail",
        message: "Main Collection not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteMainCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  try {
    //? Search if main collection exists
    const mainCollectionFound = await prisma.mainCollection.findUnique({
      where: {
        id: id,
      },
    });

    if (mainCollectionFound) {
      const deletedMainCollection = await prisma.mainCollection.delete({
        where: {
          id: id,
        },
      });

      res.json({
        status: "success",
        message: "Main collection deleted successfully!",
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Main Collection not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteMainCollectionImage = async (req, res) => {
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//* SUB-COLLECTION CONTROLLERS (E.g. Aurora, Daria, etc)
const getAllCollections = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        image: true,
        products: {
          select: {
            product_id: true,
            product_title: true,
          },
        },
      },
    });
    if (!collections)
      return res.json({ status: "fail", message: "No collections found." });
    res.json(collections);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const getCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = req.params.id;
  try {
    const collection = await prisma.collection.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        image: true,
        products: {
          select: {
            product_id: true,
            product_title: true,
            published: true,
          },
        },
        mainCollectionId: true,
      },
    });
    // If Product DOES NOT exist
    if (!collection)
      return res.json({
        status: "fail",
        message: "Collection does not exist.",
      });

    // If Collection Exists, send as response:
    res.json(collection);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const createCollection = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const { name, description, status, image } = req.body;

  try {
    const newCollection = await prisma.collection.create({
      data: {
        name,
        description,
        status,
        image,
      },
    });

    if (!newCollection)
      return res.json({
        status: "fail",
        message: "Failed to create collection!",
      });

    res.json({
      message: "Collection created successfully!",
      status: "success",
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const updateCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  const { name, description, status, image, mainCollectionId } = req.body;

  try {
    //? First search if collection exists:
    const collection = await prisma.collection.findUnique({
      where: {
        id: id,
      },
    });

    if (collection) {
      const updatedCollection = await prisma.collection.update({
        where: {
          id: id,
        },
        data: {
          name: name || collection.name,
          description: description || collection.description,
          status: status || collection.status,
          image: image || collection.image,
          mainCollectionId: mainCollectionId || collection.mainCollectionId,
        },
      });

      res.json({
        status: "success",
        message: "Collection updated successfully!",
      });
    } else {
      // If item does not exist, return error based response
      res.status(404).json({
        status: "fail",
        message: "Collection not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteCollectionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  try {
    //? Search if collection exists
    const collectionFound = await prisma.collection.findUnique({
      where: {
        id: id,
      },
    });
    if (collectionFound) {
      const deletedCollection = await prisma.collection.delete({
        where: {
          id: id,
        },
      });
      res.json({
        message: "Collection deleted successfully!",
        data: deletedCollection,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Collection not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteCollectionImage = async (req, res) => {
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//? For 'updateProduct' page, 'collections' select tag
const findCollectionForDropdown = async (req, res) => {
  const { id } = req.params;

  //? Get and send all collections with their 'id' and 'name' to populate dropdown
  const allCollections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  if (!allCollections) {
    return res.json({ status: "fail", message: "Collections not found" });
  }

  //? Get product ID to find product and get its 'collectionId'
  const productFound = await prisma.product.findUnique({
    where: {
      product_id: Number(id),
    },
    select: {
      collectionId: true,
    },
  });

  //? Find collection to which product belongs to
  const collectionBelongsTo = await prisma.collection.findUnique({
    where: {
      id: productFound.collectionId,
    },
    select: {
      id: true,
    },
  });

  res.json({
    status: "success",
    collections: allCollections,
    collectionId: collectionBelongsTo.id,
  });
};

//* PRODUCT CONTROLLERS
const getAllProducts = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const products = await prisma.product.findMany();
    if (!products)
      return res.json({ status: "fail", message: "No products found." });
    res.json(products);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const getProductById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = req.params.id;
  try {
    const product = await prisma.product.findUnique({
      where: {
        product_id: Number(id),
      },
    });
    // If Product DOES NOT exist
    if (!product)
      return res.json({ status: "fail", message: "Product does not exist." });

    // If Product Exists, send as response
    res.json(product);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

// Use when 'ADD NEW PRODUCT' link is clicked and lead to new page
const postNewProduct = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const {
    product_title,
    product_price,
    product_description,
    product_types,
    product_tags,
    published,
    product_size,
    gold_color,
    enamel_colors,
    hook_options,
    product_images,
    collectionId,
  } = req.body;

  try {
    await prisma.product.create({
      data: {
        product_title,
        product_description,
        product_types,
        product_tags,
        published,
        product_size,
        gold_color,
        enamel_colors,
        hook_options,
        product_price: Number(product_price),
        product_images,
        collectionId: Number(collectionId),
      },
    });

    res.json({ message: "Product created successfully!", status: "success" });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

// Use 'UPDATE' method on a product page where product ALREADY EXISTS
const updateProductById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = req.params.id;
  const {
    product_title,
    product_price,
    product_description,
    product_types,
    product_tags,
    published,
    product_size,
    gold_color,
    enamel_colors,
    hook_options,
    product_images,
    collectionId,
  } = req.body;

  try {
    //? First search if product exists:
    const item = await prisma.product.findUnique({
      where: {
        product_id: Number(id),
      },
    });
    if (item) {
      const updatedProduct = await prisma.product.update({
        where: {
          product_id: Number(id),
        },
        data: {
          product_title: product_title || item.product_title,
          product_description: product_description || item.product_description,
          product_types: product_types || item.product_types,
          product_tags: product_tags || item.product_tags,
          published: published || item.published,
          product_size: product_size || item.product_size,
          gold_color: gold_color || item.gold_color,
          enamel_colors: enamel_colors || item.enamel_colors,
          hook_options: hook_options || item.hook_options,
          product_price: Number(product_price) || item.product_price,
          product_images: product_images || item.product_images,
          collectionId: Number(collectionId) || item.collectionId,
        },
      });

      res.json({
        message: "Product updated successfully!",
        status: "success",
      });
    } else {
      // If item does not exist, return error based response
      res.status(404).json({
        status: "fail",
        message: "Product not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteProductById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  try {
    //? Search if product exists
    const productFound = await prisma.product.findUnique({
      where: {
        product_id: id,
      },
    });
    if (productFound) {
      const deletedProduct = await prisma.product.delete({
        where: {
          product_id: id,
        },
      });
      res.json({
        message: "Product deleted successfully!",
        data: deletedProduct,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Product not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//* CATEGORIES CONTROLLERS
const getAllCategories = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    if (!categories)
      return res.json({
        status: "fail",
        message: "No Categories found.",
      });
    res.json(categories);
  } catch (error) {
    console.log(error);
    prismaDefaultError(error, res);
  }
};

const getCategoryById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = req.params.id;
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
      },
    });
    // If category DOES NOT exist
    if (!category)
      return res.json({
        status: "fail",
        message: "Category does not exist",
      });

    // If Category Exists, send as response:
    res.json(category);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const postNewCategory = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const { name, image } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        image,
      },
    });

    if (!category)
      return res.json({
        status: "fail",
        message: "Failed to create new category!",
      });

    res.json({
      status: "success",
      message: "Category created successfully!",
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const updateCategoryById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  const { name, image } = req.body;

  try {
    //? First search if category exists:
    const category = await prisma.category.findUnique({
      where: {
        id: id,
      },
    });

    if (category) {
      const updatedCategory = await prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name: name || category.name,
          image: image || category.image,
        },
      });

      res.json({
        status: "success",
        message: "Category updated successfully!",
      });
    } else {
      // If item does not exist, return error based response
      res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteCategoryById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  try {
    //? Search if category exists
    const categoryFound = await prisma.category.findUnique({
      where: {
        id: id,
      },
    });

    if (categoryFound) {
      const deletedCategory = await prisma.category.delete({
        where: {
          id: id,
        },
      });

      res.json({
        status: "success",
        message: "Category deleted successfully!",
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteCategoryImage = async (req, res) => {
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

//* USER CONTROLLERS
//? Get all customers/users for 'Customers' page
const getAllUsers = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        addresses: true,
        orders: {
          select: {
            orderNumber: true,
            cartItems: true,
          },
        },
      },
    });

    if (!users) return res.json({ status: "fail", message: "No users found" });

    return res.json({ status: "success", data: users });

    if (users) {
      // Create newUsers array to return as RESPONSE with custom 'address' field as required
      const newUsers = users.map((eachUser) => {
        const isPrimaryAddress = eachUser.addresses.find(
          (address) => address.isPrimary
        );
        const address = {
          city: isPrimaryAddress.city,
          country: isPrimaryAddress.country,
        };
        return {
          id: eachUser.id,
          name: `${eachUser.first_name} ${eachUser.last_name}`,
          primaryAddress: address,
          // orderCount: eachUser.orders.length,
          // orderTotal: eachUser.orders.reduce(
          //   (prev, curr) => prev + curr.total,
          //   0
          // ),
        };
      });
      res.json(newUsers);
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? Get User/Customer by ID for 'Customer' page
const getUserById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const userId = Number(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        addresses: true,
        orders: {
          select: {
            orderNumber: true,
            fulfillmentStatus: true,
            createdAt: true,
            total: true,
          },
        },
      },
    });

    if (user) {
      const primaryAddress = user.addresses.find(
        (eachAddress) => eachAddress.isPrimary
      );
      const newUser = {
        userInfo: {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          primaryAddress,
        },
        orderInfo: {
          orderCount: user.orders.length,
          totalSpent: user.orders.reduce((prev, curr) => prev + curr.total, 0),
          orders: user.orders,
        },
      };
      res.json(newUser);
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteUserById = (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const userId = Number(req.params.id);

  prisma.user
    .delete({
      where: {
        id: userId,
      },
    })
    .then(() => {
      res.json({ status: "success", message: "User deleted successfully" });
    })
    .catch((error) => prismaDefaultError(error, res));
};

//* ORDERS
const getAllOrders = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const orders = await prisma.orders.findMany({
      select: {
        orderNumber: true,
        createdAt: true,
        fulfillmentStatus: true,
        totalAmt: true,
        shipping: true,
        payment_status: true,
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!orders)
      return res
        .status(404)
        .json({ status: "fail", message: "Orders not found." });

    const ordersReformatted = orders.map((eachOrder) => {
      return {
        orderNumber: eachOrder.orderNumber,
        createdAt: eachOrder.createdAt,
        fulfillmentStatus: eachOrder.fulfillmentStatus,
        totalAmt: eachOrder.totalAmt,
        shippingMethod: eachOrder.shipping.shippingMethod,
        name: `${eachOrder.user.first_name} ${eachOrder.user.last_name}`,
        payment_status: eachOrder.payment_status,
      };
    });

    res.json({ status: "success", data: ordersReformatted });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const getOrderById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  const id = Number(req.params.id);
  try {
    // Find if Order exists by ID
    const order = await prisma.orders.findUnique({
      where: {
        orderNumber: id,
      },
      select: {
        orderNumber: true,
        fulfillmentStatus: true,
        createdAt: true,
        cartItems: true,
        subtotalAmt: true,
        taxAmt: true,
        shippingAmt: true,
        totalAmt: true,
        shipping: true,
        payment_status: true,
      },
    });

    // If Order DOES NOT exist
    if (!order)
      return res.json({ status: "fail", message: "Order does not exist." });

    // If Order Exists, send as response
    res.json({ status: "success", data: order });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//* CONDITIONS
const getAllConditions = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    const conditions = await prisma.conditions.findMany({
      select: {
        shipping: true,
        refundAndExchange: true,
        accountsAndMembership: true,
        repairsAndDefects: true,
        payment: true,
        websiteUsage: true,
        shoppingAtAurora: true,
        pricingPolicy: true,
        propertyAndRisk: true,
        safetyOfPersonalDetails: true,
        copyrightAndTrademarks: true,
        content: true,
        thirdPartyLinks: true,
        acceptanceOfTerms: true,
        backups: true,
      },
    });

    if (!conditions) {
      return res.json({ status: "fail", message: "No conditions found." });
    }

    res.json(...conditions);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const postNewCondition = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'

  let newBody = {};
  for (const item in req.body) {
    newBody[item] = req.body[item].split("|").join(" ");
  }

  try {
    const newCondition = await prisma.conditions.create({
      data: newBody,
    });

    res.json({
      message: "Conditions created successfully!",
      data: newCondition,
    });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const updateConditionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'

  try {
    //? First search if product exists:
    const conditions = await prisma.conditions.findUnique({
      where: {
        id: 1,
      },
    });

    if (conditions) {
      let newBody = {};
      for (const item in req.body) {
        newBody[item] = req.body[item].split("|").join(" ").trim();
      }

      const updatedConditions = await prisma.conditions.update({
        where: {
          id: 1,
        },
        data: {
          shipping: newBody.shipping || conditions.shipping,
          refundAndExchange:
            newBody.refundAndExchange || conditions.refundAndExchange,
          accountsAndMembership:
            newBody.accountsAndMembership || conditions.accountsAndMembership,
          repairsAndDefects:
            newBody.repairsAndDefects || conditions.repairsAndDefects,
          payment: newBody.payment || conditions.payment,
          websiteUsage: newBody.websiteUsage || conditions.websiteUsage,
          shoppingAtAurora:
            newBody.shoppingAtAurora || conditions.shoppingAtAurora,
          pricingPolicy: newBody.pricingPolicy || conditions.pricingPolicy,
          propertyAndRisk:
            newBody.propertyAndRisk || conditions.propertyAndRisk,
          safetyOfPersonalDetails:
            newBody.safetyOfPersonalDetails ||
            conditions.safetyOfPersonalDetails,
          copyrightAndTrademarks:
            newBody.copyrightAndTrademarks || conditions.copyrightAndTrademarks,
          content: newBody.content || conditions.content,
          thirdPartyLinks:
            newBody.thirdPartyLinks || conditions.thirdPartyLinks,
          acceptanceOfTerms:
            newBody.acceptanceOfTerms || conditions.acceptanceOfTerms,
          backups: newBody.backups || conditions.backups,
        },
      });

      res.json({
        message: "Conditions updated successfully!",
        data: updatedConditions,
      });
    } else {
      // If conditions do not exist, return error based response
      res.status(404).json({
        status: "fail",
        message: "Conditions not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const deleteConditionById = async (req, res) => {
  //! Need to check if ADMIN first, only then allow access, otherwise 'FORBIDDEN'
  try {
    //? Search if conditions exist
    const conditionsFound = await prisma.conditions.findUnique({
      where: {
        id: 1,
      },
    });

    if (conditionsFound) {
      const deletedConditions = await prisma.conditions.delete({
        where: {
          id: 1,
        },
      });

      res.json({
        message: "Conditions deleted successfully!",
        data: deletedConditions,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Conditions not found.",
      });
    }
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

export {
  getAllCategories,
  getCategoryById,
  postNewCategory,
  updateCategoryById,
  deleteCategoryById,
  deleteCategoryImage,
  getAllMainCollections,
  getMainCollectionById,
  createMainCollection,
  updateMainCollectionById,
  deleteMainCollectionById,
  deleteMainCollectionImage,
  getAllCollections,
  getCollectionById,
  updateCollectionById,
  createCollection,
  deleteCollectionById,
  deleteCollectionImage,
  findCollectionForDropdown,
  getAllProducts,
  getProductById,
  postNewProduct,
  updateProductById,
  deleteProductById,
  getAllUsers,
  getUserById,
  deleteUserById,
  getAllOrders,
  getOrderById,
  getAllConditions,
  postNewCondition,
  updateConditionById,
  deleteConditionById,
};
