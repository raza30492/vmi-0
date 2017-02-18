package com.example.vmi.util;

import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

public class MiscUtil {

    public static int getWeekFromFilename(String filename) {
        String week = filename.split("_")[1];

        return Integer.parseInt(week.replace("Week", ""));
    }
    
    public static Boolean sendMail(String to,String sub,String msg){
        
        String host = "mail.laguna-clothing.com";
        String user = "itsupport@laguna-clothing.com";
        String password = "***S***@522";

//        String host = "mail.zahidraza.in";
//        String user = "noreply@zahidraza.in";
//        String password = "Munnu@90067";
        

        Boolean status = false;
        
        Properties prop = new Properties();
        
        prop.put("mail.smtp.host", host);
        prop.put("mail.smtp.auth",true);
        
        Session session = Session.getInstance(prop,  
                                new javax.mail.Authenticator() {  
                                    protected PasswordAuthentication getPasswordAuthentication() {  
                                        return new PasswordAuthentication(user,password);  
                                    }  
                                }); 
        
        //Compose the message  
        try {  
            MimeMessage message = new MimeMessage(session);  
            message.setFrom(new InternetAddress(user));  
            message.addRecipient(Message.RecipientType.TO,new InternetAddress(to));  
            message.setSubject(sub);  
            message.setText(msg);  

            //send the message  
            Transport.send(message);  

            status = true;
        }catch (MessagingException e) {
             e.printStackTrace();
        } 
        
        return status;
    }
}
