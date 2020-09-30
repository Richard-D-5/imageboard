const spicedPg = require("spiced-pg");

let db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

exports.getImages = () => {
    return db.query(
        `SELECT *
        FROM images
        ORDER BY id DESC
        LIMIT 7`
    );
};

exports.addImage = (title, description, username, url) => {
    return db.query(
        `INSERT INTO images (title, description, username, url)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [title, description, username, url]
    );
};

exports.getComments = (imageId) => {
    return db.query(
        `SELECT comments.username, comments, images_id, comments.created_at
        FROM comments
        JOIN images
        ON images.id = comments.images_id
        WHERE comments.images_id = $1`,
        [imageId]
    );
};

exports.addComments = (comments, images_id, username) => {
    return db.query(
        `INSERT INTO comments (comments, images_id, username)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [comments, images_id, username]
    );
};

exports.getImageInfo = (imageId) => {
    return db.query(
        `SELECT *
        FROM images
        WHERE id = $1`,
        [imageId]
    );
};

exports.getMoreImages = (lastId) => {
    return db
        .query(
            `SELECT * , (
              SELECT id FROM images
              ORDER BY id ASC
              LIMIT 1) AS "lowestId" 
      FROM images
      WHERE id < $1
      ORDER BY id DESC
      LIMIT 7`,
            [lastId]
        )
        .then(({ rows }) => rows);
};
