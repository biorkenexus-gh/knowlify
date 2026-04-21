import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTask,
} from "firebase/storage";
import { storage } from "./client";

export interface UploadProgress {
  task: UploadTask;
  promise: Promise<string>;
}

export function uploadFile(path: string, file: File): UploadProgress {
  const r = ref(storage, path);
  const task = uploadBytesResumable(r, file, { contentType: file.type });
  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      undefined,
      (err) => reject(err),
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
  return { task, promise };
}

export async function getUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path));
}
