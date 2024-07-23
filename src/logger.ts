import { appendFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

import axios from "axios";

class Logger {
  private logDirectory: string;
  private cloudLoggingUrl: string;
  private shouldConsoleLog = true;
  private shouldCloudLog = false;
  private shouldFileLog = false;

  constructor(
    logDirectory: string = "logs",
    cloudLoggingUrl: string = "",
    shouldConsoleLog = true,
    shouldCloudLog = false,
    shouldFileLog = false
  ) {
    this.shouldConsoleLog = shouldConsoleLog;
    this.shouldCloudLog = shouldCloudLog;
    this.shouldFileLog = shouldFileLog;
    this.logDirectory = logDirectory;
    this.cloudLoggingUrl = cloudLoggingUrl;

    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory);
    }
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split("T")[0];
  }

  private getLogFilePath(): string {
    return path.join(this.logDirectory, `${this.getCurrentDate()}.log`);
  }

  private async logToCloud(message: string, level: string): Promise<void> {
    if (this.cloudLoggingUrl) {
      try {
        await axios.post(this.cloudLoggingUrl, {
          timestamp: new Date().toISOString(),
          level,
          message,
        });
      } catch (error) {
        console.error(`Failed to log to cloud: ${error}`);
      }
    }
  }

  private async log(message: string, level: string): Promise<void> {
    const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;

    if (this.shouldConsoleLog) {
      // Console log
      console.log(logMessage);
    }

    if (this.shouldFileLog) {
      // Write to file
      appendFileSync(this.getLogFilePath(), logMessage, { encoding: "utf8" });
    }

    if (this.shouldCloudLog) {
      // Log to cloud
      await this.logToCloud(message, level);
    }
  }

  public async info(message: string): Promise<void> {
    await this.log(message, "info");
  }

  public async warn(message: string): Promise<void> {
    await this.log(message, "warn");
  }

  public async error(message: string): Promise<void> {
    await this.log(message, "error");
  }
}

export default Logger;
