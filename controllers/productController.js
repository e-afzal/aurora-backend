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

//? Homepage: "New Arrivals" section
const fetchNewArrivals = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        product_id: true,
        product_title: true,
        product_images: true,
      },
      orderBy: [
        {
          product_id: "desc",
        },
      ],
    });

    // Sending only 8 products from total
    const slicedProducts = products.slice(0, 6);
    return res.json(slicedProducts);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? For use on 'SHOP ALL' or 'collections/all' page
const fetchAllProducts = async (req, res) => {
  try {
    const foundProducts = await prisma.product.findMany({
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
    });

    const foundCategories = await prisma.category.findMany({
      select: {
        name: true,
      },
    });

    if (!foundProducts)
      return res.json({ status: "fail", message: "Products not found." });

    if (!foundCategories)
      return res.json({ status: "fail", message: "Categories not found" });

    res.json({ products: foundProducts, categories: foundCategories });
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

const fetchProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await prisma.product.findUnique({
      where: {
        product_id: Number(id),
      },
    });
    if (!product) {
      return res.json({ status: "fail", message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

//? For use on Single 'Category page' E.g. Rings-only page
//? @url_backend - '/api/products/category/:category_type'
//? For use on '/products/category' frontend page
const fetchCategoryProducts = async (req, res) => {
  const { category_type } = req.params;

  //? STEP 1: Find Categories
  const foundCategory = await prisma.category.findUnique({
    where: {
      name: category_type,
    },
    select: {
      name: true,
      products: {
        select: {
          product_id: true,
          product_images: true,
          product_title: true,
          product_price: true,
          collection: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!foundCategory) {
    return res.json({ status: "fail", message: "Category not found" });
  }

  //? STEP 2: Find Collections
  const foundCollections = await prisma.collection.findMany({
    select: {
      name: true,
    },
  });

  if (!foundCollections) {
    return res.json({ status: "fail", message: "Collections not found" });
  }

  //? STEP 3: Send Data
  res.json({ category: foundCategory, collection: foundCollections });
};

//? Prisma's "Full Text Search" feature is used here. Google 'prisma full text search'
//? for more details
const searchProducts = async (req, res) => {
  const { queryString } = req.body;
  const queryModified =
    queryString && queryString.length > 3
      ? queryString.toLowerCase().trim()
      : "";
  try {
    const products = await prisma.product.findMany({
      where: {
        product_title: {
          search: queryModified,
        },
        product_types: {
          search: queryModified,
        },
      },
      orderBy: {
        product_title: "asc",
      },
      select: {
        product_id: true,
        product_images: true,
        product_title: true,
        product_price: true,
        product_types: true,
      },
    });
    if (!products)
      return res.json({ status: "fail", message: "Products not found." });

    //? Returning only 4 results to show in Search DIV on frontend
    res.json(products);
  } catch (error) {
    prismaDefaultError(error, res);
  }
};

export {
  fetchNewArrivals,
  fetchAllProducts,
  fetchProductById,
  fetchCategoryProducts,
  searchProducts,
};
