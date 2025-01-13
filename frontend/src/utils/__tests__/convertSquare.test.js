import { expect, it, describe } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import convertSquare from "../convertSquare";
import { Jimp } from "jimp";
import { Buffer } from "node:buffer";
// Initially 360 x 360 image
// eslint-disable-next-line no-undef
const pngBuffer = readFileSync(resolve(__dirname, "./assets/png-file.png"));

describe("convertSquare()", () => {
  it("returns base64 of an image that is 200 x 200", async () => {
    const base64 = await convertSquare(pngBuffer, "image/png");

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    const resultBuffer = Buffer.from(base64Data, "base64url");

    const image = await Jimp.fromBuffer(resultBuffer);

    expect(image.height).toBe(200);
    expect(image.width).toBe(200);
  });

  it("returns smaller base64 of an image", async () => {
    const base64 = await convertSquare(pngBuffer, "image/png");

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    const resultBuffer = Buffer.from(base64Data, "base64url");

    expect(resultBuffer.byteLength).toBeLessThanOrEqual(
      (200 / 360) * pngBuffer.byteLength
    );
  });

  it("works with custom size", async () => {
    const base64 = await convertSquare(pngBuffer, "image/png", 50);

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    const resultBuffer = Buffer.from(base64Data, "base64url");

    const image = await Jimp.fromBuffer(resultBuffer);

    expect(image.height).toBe(50);
    expect(image.width).toBe(50);
  });

  it("works with jpeg", async () => {
    const jpegBuffer = readFileSync(
      // eslint-disable-next-line no-undef
      resolve(__dirname, "./assets/jpeg-file.jpeg")
    );

    const base64 = await convertSquare(jpegBuffer, "image/jpeg");

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    const resultBuffer = Buffer.from(base64Data, "base64url");

    const image = await Jimp.fromBuffer(resultBuffer);

    expect(image.height).toBe(200);
    expect(image.width).toBe(200);
  });

  it("works with jpg (a filename)", async () => {
    const jpgBuffer = readFileSync(
      // eslint-disable-next-line no-undef
      resolve(__dirname, "./assets/jpg-file.jpg")
    );

    const base64 = await convertSquare(jpgBuffer, "image/jpeg");

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");

    const resultBuffer = Buffer.from(base64Data, "base64url");

    const image = await Jimp.fromBuffer(resultBuffer);

    expect(image.height).toBe(200);
    expect(image.width).toBe(200);
  });

  it("throws on too big of an size", async () => {
    await expect(
      async () => await convertSquare(pngBuffer, "image/png", 5000)
    ).rejects.toThrow("Too big crop size");
  });
});
