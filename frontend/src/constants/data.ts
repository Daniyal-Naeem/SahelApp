import icons from './icons';
import images from './images';
import {FeaturesTypes, ProductTypes, SplashTypes, TabBarTypes} from './types';
import type {OrderData} from '../components/OrderCard';

const randomImage = (): string =>
  `https://picsum.photos/${Math.floor(Math.random() * 1000) + 1}/${
    Math.floor(Math.random() * 1000) + 1
  }`;

const SplashData: SplashTypes[] = [
  {
    image: images.splash1,
    title: 'Choose Products',
    description:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
  },
  {
    image: images.splash2,
    title: 'Make Payment',
    description:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
  },
  {
    image: images.splash3,
    title: 'Get Your Order',
    description:
      'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
  },
];
const CategoriesData: FeaturesTypes[] = [
  {
    image: randomImage(),
    title: 'Beauty',
  },
  {
    image: randomImage(),
    title: 'Fashion',
  },
  {
    image: randomImage(),
    title: 'Kids',
  },
  {
    image: randomImage(),
    title: 'Mens',
  },
  {
    image: randomImage(),
    title: 'Womens',
  },

  {
    image: randomImage(),
    title: 'Home & Kitchen',
  },
  {
    image: randomImage(),
    title: 'Gifts',
  },
];

const titles = [
  'Women Printed Kurta',
  'HRX by Hrithik Roshan',
  "IWC Schaffhausen 2021 Pilot's Watch",
  'Labbin White Sneakers',
  'Black Winter Jacket',
  'Mens Starry Printed Shirt',
  'Black Dress',
  'Pink Embroidered Dress',
  'Realme 7',
  'Black Jacket',
  'D7200 Digital Camera',
  "Men's & Boys Formal Shoes",
];

const vendors = [
  'FashionHub',
  'TechStore',
  'BeautyBazaar',
  'SportZone',
  'HomeDecor Plus',
  'ElectroMart',
  'StyleCentral',
  'GadgetWorld',
  'LuxuryLane',
  'DailyEssentials',
  'PremiumBrands',
  'TrendyWear',
  'SmartShop',
  'ValueMart',
  'EliteCollection',
];

const randomTitle = (): string =>
  titles[Math.floor(Math.random() * titles.length)];

const randomPrice = (): number =>
  parseFloat((Math.floor(Math.random() * 5000) + 500).toFixed(2));

const randomPriceBeforeDeal = (): number =>
  parseFloat(
    (randomPrice() + (Math.floor(Math.random() * 1000) + 100)).toFixed(2),
  );

const randomPriceOff = (price: number, priceBeforeDeal: number): string =>
  ((1 - price / priceBeforeDeal) * 100).toFixed(2);

const randomStars = (): number => Math.random() * 5;

const randomNumberOfReview = (): number => Math.floor(Math.random() * 10000);

const randomVendor = (): string =>
  vendors[Math.floor(Math.random() * vendors.length)];

const ProductData: ProductTypes[] = Array.from(
  {length: 15},
  (): ProductTypes => {
    const price = randomPrice();
    const priceBeforeDeal = randomPriceBeforeDeal();
    return {
      _id: `product-${Math.random().toString(36).substr(2, 9)}`,
      image: [randomImage()],
      title: randomTitle(),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      price: price,
      priceBeforeDeal: priceBeforeDeal,
      priceOff: randomPriceOff(price, priceBeforeDeal),
      stars: randomStars(),
      numberOfReview: randomNumberOfReview(),
      vendor: randomVendor(),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };
  },
);
const tabName = ['Home', 'Wishlist', 'Cart', 'Search', 'Setting'];
const TabBarData: TabBarTypes[] = [
  {
    title: tabName[0],
    image: icons.home,
    link: tabName[0],
    inActiveColor: '#000000',
    activeColor: '#EB3030',
  },
  {
    title: tabName[1],
    image: icons.home,
    link: tabName[1],
    inActiveColor: '#000000',
    activeColor: '#EB3030',
  },
  {
    title: tabName[2],
    image: icons.home,
    link: tabName[2],
    inActiveColor: '#050404',
    activeColor: '#EB3030',
    inActiveBGColor: '#FFFFFF',
    activeBGColor: '#EB3030',
  },
  {
    title: tabName[3],
    image: icons.home,
    link: tabName[3],
    inActiveColor: '#000000',
    activeColor: '#EB3030',
  },
  {
    title: tabName[4],
    image: icons.home,
    link: tabName[4],
    inActiveColor: '#000000',
    activeColor: '#EB3030',
  },
];

const DetailedProductData: ProductTypes[] = [
  {
    _id: '1',
    title: 'Pack of 12 Matte lipsticks',
    description:
      'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur adipiscing elit. High-quality matte finish lipsticks in 12 stunning shades. Long-lasting formula that stays put all day.',
    subtitle: 'Premium Matte Lipstick Collection - All Shades',
    price: 80,
    priceBeforeDeal: 90,
    priceOff: '40%',
    stars: 4.5,
    numberOfReview: 56890,
    vendor: 'BeautyBazaar',
    image: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1626179450517-53c541fced0c?w=500&h=500&fit=crop',
    ],
    status: {
      icon: '🔥',
      name: 'Hot Deal',
    },
    ukSide: ['Set of 12', 'Set of 6', 'Set of 3'],
    tags: ['beauty', 'makeup', 'lipstick', 'matte'],
    variations: [
      {
        type: 'color',
        label: 'Color',
        options: [
          {value: 'nude', label: 'White', isSelected: false},
          {value: 'pink', label: 'Pink Collection', isSelected: false},
          {value: 'red', label: 'Red Collection', isSelected: true},
        ],
      },
    ],
    specifications: [
      {label: 'Material', value: 'Cotton 95%'},
      {label: 'Material', value: 'Nylon 5%'},
    ],
    deliveryOptions: [
      {type: 'Standard', duration: '5-7 days', price: 10},
      {type: 'Express', duration: '1-2 days', price: 25},
    ],
    colorOptions: [
      {color: '#D4A574', name: 'Nude', isSelected: false},
      {color: '#FF69B4', name: 'Pink', isSelected: false},
      {color: '#DC143C', name: 'Red', isSelected: true},
    ],
    reviews: [
      {
        id: 'r1',
        userName: 'Sarah M.',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Amazing quality! The colors are vibrant and long-lasting. Highly recommend!',
        date: '2024-01-15',
      },
      {
        id: 'r2',
        userName: 'Emma L.',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 4.5,
        comment: 'Great value for money. The matte finish is perfect.',
        date: '2024-01-10',
      },
      {
        id: 'r2a',
        userName: 'Jessica K.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        rating: 4.8,
        comment: 'Love all the shades! Perfect for my collection. The packaging is also very nice.',
        date: '2024-01-08',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
  {
    _id: '2',
    title: 'HRX by Hrithik Roshan',
    description:
      'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur adipiscing elit. Premium lip gloss collection with hydrating formula and glossy finish.',
    subtitle: 'HRX Premium Lip Gloss Collection - All Variants',
    price: 80,
    priceBeforeDeal: 90,
    priceOff: '40%',
    stars: 4.5,
    numberOfReview: 344567,
    vendor: 'SportZone',
    image: [
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1626179450517-53c541fced0c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop',
    ],
    status: {
      icon: '⭐',
      name: 'Best Seller',
    },
    ukSide: ['Clear', 'Pink Nude', 'Rose', 'Coral'],
    tags: ['beauty', 'makeup', 'lipgloss', 'hrx'],
    variations: [
      {
        type: 'color',
        label: 'Shade',
        options: [
          {value: 'clear', label: 'Clear', isSelected: false},
          {value: 'pink-nude', label: 'Pink Nude', isSelected: true},
          {value: 'rose', label: 'Rose', isSelected: false},
        ],
      },
    ],
    specifications: [
      {label: 'Material', value: 'Cotton 95%'},
      {label: 'Material', value: 'Nylon 5%'},
    ],
    deliveryOptions: [
      {type: 'Standard', duration: '5-7 days', price: 10},
      {type: 'Express', duration: '1-2 days', price: 25},
    ],
    colorOptions: [
      {color: '#FFFFFF', name: 'Clear', isSelected: false},
      {color: '#FFB6C1', name: 'Pink Nude', isSelected: true},
      {color: '#FF69B4', name: 'Rose', isSelected: false},
    ],
    reviews: [
      {
        id: 'r3',
        userName: 'Priya K.',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Love the glossy finish! Perfect for everyday wear.',
        date: '2024-01-20',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
  {
    _id: '3',
    title: 'Women Printed Kurta',
    subtitle: "Vision Alta Women's Kurta Size (All Colours)",
    description:
      'Elegant printed kurta with beautiful floral patterns. Made from premium quality fabric that ensures comfort and style. Perfect for casual and semi-formal occasions. Available in multiple colors and sizes.',
    price: 80,
    priceBeforeDeal: 90,
    priceOff: '50%',
    stars: 4.5,
    numberOfReview: 56890,
    vendor: 'FashionHub',
    image: [
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop',
    ],
    status: {
      icon: '🔥',
      name: 'Hot Deal',
    },
    ukSide: ['S', 'M', 'L', 'XL', 'XXL'],
    tags: ['fashion', 'women', 'kurta', 'ethnic', 'printed'],
    variations: [
      {
        type: 'color',
        label: 'Color',
        options: [
          {
            value: 'pink',
            label: 'Pink',
            isSelected: true,
            image:
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          },
          {
            value: 'yellow',
            label: 'Yellow',
            isSelected: false,
            image:
              'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
          },
          {
            value: 'red',
            label: 'Red',
            isSelected: false,
            image:
              'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
          },
          {
            value: 'blue',
            label: 'Blue',
            isSelected: false,
            image:
              'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400',
          },
        ],
      },
      {
        type: 'size',
        label: 'Size',
        options: [
          {value: 's', label: 'S', isSelected: false},
          {value: 'm', label: 'M', isSelected: true},
          {value: 'l', label: 'L', isSelected: false},
          {value: 'xl', label: 'XL', isSelected: false},
        ],
      },
    ],
    specifications: [
      {label: 'Material', value: 'Cotton 95%'},
      {label: 'Material', value: 'Nylon 5%'},
      {label: 'Care Instructions', value: 'Machine Washable'},
      {label: 'Fit Type', value: 'Regular Fit'},
    ],
    deliveryOptions: [
      {type: 'Standard', duration: '5-7 days', price: 10},
      {type: 'Express', duration: '1-2 days', price: 25},
    ],
    colorOptions: [
      {color: '#FF69B4', name: 'Pink', isSelected: true},
      {color: '#FFD700', name: 'Yellow', isSelected: false},
      {color: '#00FF00', name: 'Green', isSelected: false},
      {color: '#000000', name: 'Black', isSelected: false},
      {color: '#800080', name: 'Purple', isSelected: false},
    ],
    reviews: [
      {
        id: 'r4',
        userName: 'Veronika',
        userAvatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        rating: 4,
        comment:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.',
        date: '2024-01-18',
      },
      {
        id: 'r5',
        userName: 'Aisha R.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Love the design and comfort. Perfect for everyday wear.',
        date: '2024-01-12',
      },
      {
        id: 'r6',
        userName: 'Fatima A.',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        rating: 4.5,
        comment: 'Beautiful patterns and excellent fabric quality. Fits perfectly!',
        date: '2024-01-05',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
  {
    _id: '4',
    title: 'Philips BHH880/10',
    description:
      'Professional hair straightener with advanced ceramic technology. Features adjustable temperature control and quick heat-up time. Perfect for all hair types.',
    subtitle: 'Philips Hair Straightener - Professional Series',
    price: 80,
    priceBeforeDeal: 90,
    priceOff: '40%',
    stars: 4.5,
    numberOfReview: 56890,
    vendor: 'ElectroMart',
    image: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop',
    ],
    status: {
      icon: '🆕',
      name: 'New Arrival',
    },
    ukSide: ['One Size'],
    tags: ['electronics', 'haircare', 'straightener', 'philips'],
    specifications: [
      {label: 'Material', value: 'Cotton 95%'},
      {label: 'Material', value: 'Nylon 5%'},
    ],
    deliveryOptions: [
      {type: 'Standard', duration: '5-7 days', price: 10},
      {type: 'Express', duration: '1-2 days', price: 25},
    ],
    reviews: [
      {
        id: 'r7',
        userName: 'Maya S.',
        userAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop',
        rating: 4.7,
        comment: 'Excellent hair straightener! Heats up quickly and leaves hair smooth and shiny. Highly recommend!',
        date: '2024-01-22',
      },
      {
        id: 'r8',
        userName: 'Sophia L.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Best straightener I\'ve ever used. The temperature control is perfect and it doesn\'t damage my hair.',
        date: '2024-01-19',
      },
      {
        id: 'r9',
        userName: 'Layla M.',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        rating: 4.3,
        comment: 'Good quality product. Works well on my thick hair. Delivery was fast too!',
        date: '2024-01-15',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
  {
    _id: '5',
    title: 'TITAN Men Watch-1806N',
    description:
      "Elegant men's watch with classic design. Features stainless steel case, leather strap, and water resistance. Perfect for formal and casual occasions.",
    subtitle: "TITAN Classic Men's Watch Collection",
    price: 80,
    priceBeforeDeal: 90,
    priceOff: '40%',
    stars: 5,
    numberOfReview: 344567,
    vendor: 'LuxuryLane',
    image: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1524592094714-0f0654e20363?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    ],
    status: {
      icon: '⭐',
      name: 'Best Seller',
    },
    ukSide: ['42mm', '44mm'],
    tags: ['watches', 'men', 'accessories', 'titan'],
    specifications: [
      {label: 'Material', value: 'Cotton 95%'},
      {label: 'Material', value: 'Nylon 5%'},
    ],
    deliveryOptions: [
      {type: 'Standard', duration: '5-7 days', price: 10},
      {type: 'Express', duration: '1-2 days', price: 25},
    ],
    reviews: [
      {
        id: 'r10',
        userName: 'Ahmed H.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Stunning watch! The design is classic and elegant. Perfect for both formal and casual occasions. Great quality!',
        date: '2024-01-25',
      },
      {
        id: 'r11',
        userName: 'Omar K.',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        rating: 4.8,
        comment: 'Excellent craftsmanship. The leather strap is comfortable and the watch keeps perfect time.',
        date: '2024-01-20',
      },
      {
        id: 'r12',
        userName: 'Khalid A.',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 4.5,
        comment: 'Beautiful watch, very satisfied with the purchase. The water resistance is a great feature.',
        date: '2024-01-18',
      },
      {
        id: 'r13',
        userName: 'Yusuf M.',
        userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
        rating: 5,
        comment: 'Top quality watch from TITAN. The stainless steel case looks premium and the design is timeless.',
        date: '2024-01-14',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  },
];

export type IssueType =
  | 'Order Issues'
  | 'Item Quality'
  | 'Payment Issues'
  | 'Technical Assistance'
  | 'Other';

export type OrderIssueOption =
  | "I didn't receive my parcel"
  | 'I want to cancel my order'
  | 'I want to return my order'
  | 'Package was damaged'
  | 'Other';

export const issues: IssueType[] = [
  'Order Issues',
  'Item Quality',
  'Payment Issues',
  'Technical Assistance',
  'Other',
];

export const orderIssueOptions: OrderIssueOption[] = [
  "I didn't receive my parcel",
  'I want to cancel my order',
  'I want to return my order',
  'Package was damaged',
  'Other',
];

export const orders: OrderData[] = [
  {
    id: '1',
    orderNumber: '92287157',
    deliveryType: 'Standard Delivery',
    itemCount: 3,
    status: 'In Transit',
    orderDate: 'Jan 15, 2024',
    estimatedDelivery: 'Jan 19, 2024',
    trackingNumber: 'TRK123456789',
    totalAmount: 249.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100&h=100&fit=crop',
    ],
  },
  {
    id: '2',
    orderNumber: '92287158',
    deliveryType: 'Express Delivery',
    itemCount: 2,
    status: 'Delivered',
    orderDate: 'Jan 10, 2024',
    estimatedDelivery: 'Jan 12, 2024',
    trackingNumber: 'TRK987654321',
    totalAmount: 159.50,
    images: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    ],
  },
  {
    id: '3',
    orderNumber: '92287159',
    deliveryType: 'Standard Delivery',
    itemCount: 1,
    status: 'Processing',
    orderDate: 'Jan 18, 2024',
    estimatedDelivery: 'Jan 22, 2024',
    trackingNumber: 'TRK456789123',
    totalAmount: 89.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
    ],
  },
  {
    id: '4',
    orderNumber: '92287160',
    deliveryType: 'Standard Delivery',
    itemCount: 4,
    status: 'Out for Delivery',
    orderDate: 'Jan 14, 2024',
    estimatedDelivery: 'Jan 18, 2024',
    trackingNumber: 'TRK789123456',
    totalAmount: 329.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    ],
  },
  {
    id: '5',
    orderNumber: '92287161',
    deliveryType: 'Standard Delivery',
    itemCount: 2,
    status: 'Pending',
    orderDate: 'Jan 19, 2024',
    estimatedDelivery: 'Jan 23, 2024',
    totalAmount: 179.99,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
    ],
  },
];

export {
  TabBarData,
  ProductData,
  DetailedProductData,
  CategoriesData,
  SplashData,
};
