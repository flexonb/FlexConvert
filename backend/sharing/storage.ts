import { Bucket } from "encore.dev/storage/objects";

export const sharesBucket = new Bucket("shared-files", {
  public: false,
  versioned: false,
});
