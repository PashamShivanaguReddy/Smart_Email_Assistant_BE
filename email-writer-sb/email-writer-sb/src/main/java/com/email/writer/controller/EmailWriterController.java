package com.email.writer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.email.writer.service.EmailGeneratorService;

//import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api")
//@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailWriterController {

    private final EmailGeneratorService service;
    public EmailWriterController(EmailGeneratorService service) {
        this.service = service;
    }

    
    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody Emailrequest emailrequest) {
        String response = this.service.GenerateEmailReply(emailrequest);
        return ResponseEntity.ok(response);
    }

}
