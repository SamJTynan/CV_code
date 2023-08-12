drop database `webdev`;
drop user `webdevadmin`@`localhost`;

CREATE DATABASE `webdev` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE TABLE `webdev`.`users` (
 `userID` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(30) NOT NULL,
  `user_password` VARCHAR(70) NOT NULL,
  `pfp` varchar(255) default null,
  PRIMARY KEY (`userID`));



CREATE TABLE `webdev`.`tickets`(
  `ticketID` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(50) NOT NULL,
  `event` VARCHAR(50) NOT NULL,
  `seatNo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ticketID`));

CREATE USER 'webdevadmin'@'localhost' IDENTIFIED BY 'password';

GRANT SELECT, DELETE, INSERT, UPDATE ON `webdev`.* TO 'webdevadmin'@'localhost';