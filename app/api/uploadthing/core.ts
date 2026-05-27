import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Definimos un endpoint llamado "imageUploader" que solo acepta imágenes de hasta 4MB
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      // Este código se ejecuta en tu servidor cuando la imagen termina de subir
      console.log("Imagen subida con éxito. URL:", file.url);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;