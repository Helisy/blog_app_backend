create table users(
id bigint not null auto_increment,

first_name varchar(50) not null,
last_name varchar(50) not null,
email varchar(100) not null,
password varchar(255) not null,
role varchar(50) not null DEFAULT 'basic',
is_verified boolean DEFAULT false,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from users;


create table posts(
id bigint not null auto_increment,

user_id int not null,
title varchar(255) not null,
content text not null,
likes int default 0 not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from posts;

insert into posts(user_id, title, content)
values(?, ?, ?);

create table comments(
id bigint not null auto_increment,

user_id int not null,
post_id int not null,
content text not null,
likes int default 0,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from users;