package com.example.vmi.restcontroller;

import com.example.vmi.dto.Credential;
import com.example.vmi.dto.RestError;
import com.example.vmi.dto.User;
import com.example.vmi.entity.Employee;
import com.example.vmi.service.EmployeeService;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@RepositoryRestController
public class EmployeeRestController {
    
    private final Logger logger = LoggerFactory.getLogger(EmployeeRestController.class);

    @Autowired
    EmployeeService employeeService;

    @PostMapping(value = "/employees")
    public @ResponseBody
    ResponseEntity<?> save(@RequestBody User user) {
        logger.info("save(): /employees");
        if ((employeeService.findOne(user.getId()) != null) || (employeeService.findOne(user.getEmail()) != null)) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        Employee employee = employeeService.save(user);
        return new ResponseEntity<>(employee, HttpStatus.CREATED);
    }
    
    @DeleteMapping(value = "/employees/{id}")
    public @ResponseBody
    ResponseEntity<?> delete(@PathVariable("id") Long id) {
        logger.info("delete(): /employees/" + id);
        if(id == 55555){
            RestError error = new RestError(409, 409, "SUPER USER, Cannot be deleted.", "", "");
            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                    
        }else if (employeeService.findOne(id) == null) {
            RestError error = new RestError(409, 409, "User not found", "", "");
            return new ResponseEntity<>(error,HttpStatus.CONFLICT);
        }else{
            employeeService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PostMapping(value = "/employees/logon")
    public ResponseEntity<?> logon(@RequestBody Credential credential, HttpServletRequest req) {
        logger.info("logon(): /employees/logon");
        Employee employee = employeeService.authenticate(credential.getEmail(), credential.getPassword());
        Map<String, Object> response = new HashMap<>();
        if (employee != null) {
            String basic = credential.getEmail() + ":" + credential.getPassword();
            response.put("id", String.valueOf(employee.getId()));
            response.put("token", new String(Base64.encode(basic.getBytes())));
            response.put("username", employee.getName());
            response.put("role", employee.getRole());
            if (employee.getBuyer() != null) {
                response.put("buyerName", employee.getBuyer().getName());
                response.put("buyerHref", req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort() + "/api/buyers/" + employee.getBuyer().getId());
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }
    
    @PostMapping(value = "/employees/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        logger.info("logon(): /employees/forgotPassword, email:" + email);
        Employee employee = employeeService.findOne(email);
        if(employee != null){
            Boolean result = employeeService.forgotPassword(employee.getId());
            if(result){
                return new ResponseEntity<>("Password reset successful. New Password has been sent to your email id.",HttpStatus.OK);
            }else{
                return new ResponseEntity<>("Some error occured changing password. Try again later.",HttpStatus.OK);
            }
        }else{
            return new ResponseEntity<>("User not found with email id: " + email,HttpStatus.CONFLICT);
        } 
    }
    
    @PostMapping(value = "employees/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody User user){
        Employee employee = employeeService.changePassword(user.getId(), user.getOldPassword(), user.getNewPassword());
        if(employee != null){
            return ResponseEntity.ok().build();
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
