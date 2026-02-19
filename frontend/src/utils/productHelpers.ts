/**
 * Safely get the first image from a product
 * Handles various image formats: array, string, or undefined
 */
export const getProductImage = (product: any): string => {
  if (!product) return 'https://via.placeholder.com/300';
  
  // Check if image is an array
  if (Array.isArray(product.image) && product.image.length > 0) {
    return product.image[0];
  }
  
  // Check if image is a string
  if (typeof product.image === 'string' && product.image.trim() !== '') {
    return product.image;
  }
  
  // Check if images (plural) is an array
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  
  // Check if images is a string
  if (typeof product.images === 'string' && product.images.trim() !== '') {
    return product.images;
  }
  
  // Return placeholder if no image found
  return 'https://via.placeholder.com/300';
};

/**
 * Safely get all images from a product as an array
 */
export const getProductImages = (product: any): string[] => {
  if (!product) return [];
  
  // Check if image is an array
  if (Array.isArray(product.image) && product.image.length > 0) {
    return product.image.filter((img: any) => img && typeof img === 'string');
  }
  
  // Check if image is a string
  if (typeof product.image === 'string' && product.image.trim() !== '') {
    return [product.image];
  }
  
  // Check if images (plural) is an array
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.filter((img: any) => img && typeof img === 'string');
  }
  
  // Check if images is a string
  if (typeof product.images === 'string' && product.images.trim() !== '') {
    return [product.images];
  }
  
  return [];
};


