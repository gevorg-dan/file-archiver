import { METHODS, RequestManager } from "./lib/createRequest";
import { asyncTimeout } from "./lib/asyncTimeout";

export enum ArchiveStatus {
  PENDING = "pending",
  FAILED = "failed",
  READY = "ready",
}

interface ArchiveInterface {
  id?: string;
  link?: string;
  status?: ArchiveStatus;
}

class State extends RequestManager {
  currentArchive: ArchiveInterface = {};

  private updateCurrentArchive(props: ArchiveInterface) {
    this.currentArchive = { ...this.currentArchive, ...props };
  }

  private createTaskForArchiving = this.createRequest(
    "api/archive/create-task",
    METHODS.POST
  );
  private sendFileForArchiveApi = this.createRequest(
    "api/archive/create",
    METHODS.POST
  );
  private createArchiveApi = this.createRequest(
    "api/archive/create-finish",
    METHODS.POST
  );
  async createArchive(files: File[]) {
    const { link, status, archiveId } = await this.createTaskForArchiving();
    this.updateCurrentArchive({ status, id: archiveId, link });
    console.log(status);

    await Promise.all(
      files.map((file) =>
        this.sendFileForArchiveApi({
          headers: {
            "Content-Description": "File Transfer",
            "Content-type": "application/octet-stream",
            "Content-Disposition": `attachment; filename=${file.name}`,
            "Process-Id": archiveId,
            "File-Name": file.name,
          },
          body: file,
        })
      )
    );
    await this.createArchiveApi({
      headers: { "Process-Id": archiveId },
    });
  }

  private updateStatus = this.createRequest(
    "api/archive/get-status/{processId}",
    METHODS.GET
  );
  async getLinkStatus(processId: string) {
    const data = await this.updateStatus({ urlParams: { processId } });

    if (data.status === ArchiveStatus.READY) {
      this.updateCurrentArchive({
        ...this.currentArchive,
        status: data.status,
      });
      return null;
    }

    await asyncTimeout(5000);
    await this.getLinkStatus(processId);
  }
}

export default new State();
