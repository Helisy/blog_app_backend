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

original_post_id int default null,
user_id int not null,
title varchar(255) not null,
content text not null,
likes int default 0 not null,
comments int default 0 not null,
share int default 0 not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from posts;

insert into posts(user_id, title, content)
values(?, ?, ?);

create fulltext index posts_search on posts(title, content);
SELECT * FROM posts WHERE MATCH (title, content) AGAINST ('abri lata de milho' IN NATURAL LANGUAGE MODE) limit 100;

create table comments(
id bigint not null auto_increment,

user_id int not null,
post_id int not null,
content varchar(255) not null,
likes int default 0,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from comments;

create table likes(
id bigint not null auto_increment,

user_id int not null,
father_id int not null,
type varchar(15) not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

select * from likes;

select id from likes where father_id = 1 and type = "post";

create table followers(
id bigint not null auto_increment,

user_id int not null,
followed_user_id int not null,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at DATETIME,
primary key(id));

