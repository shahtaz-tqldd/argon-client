export const getCloudinaryPreviewUrl = (url, width = 300) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const uploadPath = "/image/upload/";
  const [baseUrl, imagePath] = url.split(uploadPath);

  if (!baseUrl || !imagePath) return url;
  if (imagePath.startsWith("c_scale,")) return url;

  return `${baseUrl}${uploadPath}c_scale,w_${width}/${imagePath}`;
};
