import dayjs from "dayjs";

export function log(service: string, message: string): void {
  console.log(`[${dayjs().format("HH:mm:ss")}] [${service}] ${message} X3`);
}

