import React from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import CircularProgress from "@material-ui/core/CircularProgress";

import State, { ArchiveStatus } from "./state";

export default function App() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [archiveLink, setArchiveLink] = React.useState<string | null>(null);
  const [
    archiveStatus,
    setArchiveStatus,
  ] = React.useState<ArchiveStatus | null>(null);

  const onDrop = React.useCallback((files: File[] | null) => {
    if (!files) return;
    if (files.length === 0) return;
    setSelectedFiles(files);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function sendFiles(files: File[]) {
    setArchiveStatus(ArchiveStatus.PENDING);
    setSelectedFiles([]);

    await State.createArchive(files);
    setArchiveLink(State.currentArchive.link!);
    await getLinkStatus();
  }

  async function getLinkStatus() {
    await State.getLinkStatus(State.currentArchive.id!);
    setArchiveStatus(State.currentArchive.status || null);
  }

  const status = State.currentArchive.status;
  React.useEffect(() => {
    setArchiveStatus(status || null);
  }, [status]);

  return (
    <AppWrapper>
      <DropZone
        {...getRootProps()}
        disabled={archiveStatus === ArchiveStatus.PENDING}
      >
        <input {...getInputProps()} />
        {selectedFiles.length !== 0 ? (
          selectedFiles.map((file, index) => (
            <FileComponent key={index}>{file.name}</FileComponent>
          ))
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </DropZone>
      <button
        onClick={() => sendFiles(selectedFiles)}
        style={{ marginBottom: "20px" }}
        disabled={selectedFiles.length === 0}
      >
        Создать архив
      </button>
      <LinkContainer>
        {archiveStatus === ArchiveStatus.PENDING ? (
          <CircularProgress />
        ) : (
          archiveLink && (
            <a
              href={archiveLink}
              download
              onClick={() => {
                setArchiveLink(null);
                setArchiveStatus(null);
              }}
            >
              download
            </a>
          )
        )}
      </LinkContainer>
    </AppWrapper>
  );
}

const LinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  width: 100%;
`;

const FileComponent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  color: #005eff;
`;

const DropZone = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
  width: 100%;
  max-width: 900px;
  height: 300px;
  border-radius: 10px;
  border: 3px dashed ${({ disabled }) => (disabled ? "#5b5e62" : "#3f51b5")};
  outline: none;
  margin-bottom: 30px;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "default")};
  overflow: hidden;
`;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  padding: 0 15%;
`;
