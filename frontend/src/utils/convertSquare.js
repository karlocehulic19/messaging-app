import { Jimp } from "jimp";

export default async function convertSquare(
  pictureBuffer,
  pictureType,
  size = 200
) {
  const picture = await Jimp.fromBuffer(pictureBuffer);
  if (size > picture.height || size > picture.width)
    throw new Error("Too big crop size");
  picture.cover({ w: size, h: size });
  return await picture.getBase64(pictureType);
}
