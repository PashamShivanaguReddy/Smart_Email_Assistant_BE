package com.email.writer.controller;


//import lombok.Data;

//@Data
public class Emailrequest {

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    private String emailContent;
    private String tone;

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}