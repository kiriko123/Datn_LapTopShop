package com.datn.be.controller;

import com.datn.be.dto.response.FileResponse;
import com.datn.be.exception.StorageException;
import com.datn.be.service.FileService;
import com.datn.be.util.annotation.ApiMessage;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.http.fileupload.FileUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FileController {

    @Value("${khang.upload-file.base-uri}")
    private String baseUri;

    private final FileService fileService;

    @PostMapping("/files")
    @ApiMessage("Upload single file")
    public ResponseEntity<?> uploadFile(@RequestParam(name = "file", required = true) MultipartFile file,
                                        @RequestParam("folder") String folder) throws URISyntaxException, IOException {
        //validate
        if (file.isEmpty()) {
            throw new FileUploadException("File is empty");
        }

        String fileName = file.getOriginalFilename();
        List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx", "webp");

        boolean isValid = allowedExtensions.stream().anyMatch(item -> fileName.toLowerCase().endsWith(item));
        if (!isValid) {
            throw new FileUploadException("File is not valid");
        }

        //create a directory if not exist
        fileService.createDirectory(baseUri + folder);
        //store file
        String uploadFile =  fileService.storeFile(file, folder);


        return ResponseEntity.status(HttpStatus.CREATED).body(FileResponse.builder()
                .fileName(uploadFile)
                .uploadedAt(Instant.now())
                .build());
    }
    @GetMapping("/files")
    @ApiMessage("Download a file")
    public ResponseEntity<Resource> download(
            @RequestParam(name = "fileName", required = false) String fileName,
            @RequestParam(name = "folder", required = false) String folder)
            throws StorageException, URISyntaxException, FileNotFoundException {
        if (fileName == null || folder == null) {
            throw new StorageException("Missing required params : (fileName or folder) in query params.");
        }

        // check file exist (and not a directory)
        long fileLength = this.fileService.getFileLength(fileName, folder);
        if (fileLength == 0) {
            throw new StorageException("File with name = " + fileName + " not found.");
        }

        // download a file
        InputStreamResource resource = this.fileService.getResource(fileName, folder);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentLength(fileLength)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
