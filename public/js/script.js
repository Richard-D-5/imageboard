(function () {
    Vue.component("image-compenent", {
        template: "#template",
        props: ["id"],
        data: function () {
            return {
                obj: {
                    id: null,
                    title: "",
                    description: "",
                    username: "",
                    url: "",
                    created_at: null,
                },
                comments: [],
                commentObj: {
                    comment: "",
                    username: "",
                },
            };
        },
        mounted: function () {
            var thisData = this;
            axios
                .get("/getImageInfo/" + thisData.id)
                .then(function (res) {
                    console.log("res getImageInfo: ", res);
                    // thisData.comments.created_at = new Intl.DateTimeFormat(
                    //     "de-DE"
                    // ).format(new Date(res.data.commentsData.created_at));
                    thisData.obj = res.data.imageData[0];
                    thisData.comments = res.data.commentsData;
                })
                .catch((err) => {
                    console.log("err in getImageInfo: ", err);
                });
        },
        watch: {
            id: function () {
                var thisData = this;
                console.log("Changed!! ImageId changed");
                axios
                    .get("/getImageInfo/" + thisData.id)
                    .then(function (res) {
                        thisData.obj = res.data[0];
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
        },
        methods: {
            closeModal: function () {
                console.log("close modal");
                this.$emit("close");
            },
            postComment: function () {
                var thisData = this;
                console.log("thisData: ", thisData);
                console.log(
                    "commentObj.comment: ",
                    thisData.commentObj.comment
                );
                console.log(
                    "commentObj.username: ",
                    thisData.commentObj.username
                );

                var userComment = {};
                userComment.comment = thisData.commentObj.comment;
                userComment.images_id = thisData.obj.id;
                userComment.username = thisData.commentObj.username;

                axios
                    .post("/upload-comments", userComment)
                    .then(function (res) {
                        console.log(
                            "res.data[0].created_at: ",
                            res.data[0].created_at
                        );
                        // thisData.obj.created_at = formatDate(
                        //     res.data[0].created_at
                        // );
                        res.data[0].created_at = new Intl.DateTimeFormat(
                            "de-DE"
                        ).format(new Date(res.data[0].created_at));
                        console.log(
                            "thisData.obj.created_at in axios post comment: ",
                            thisData.obj.created_at
                        );
                        thisData.comments.unshift(res.data[0]);
                        console.log("thisData.obj: ", thisData.comments);
                        thisData.commentObj.comment = "";
                        thisData.commentObj.username = "";
                    })
                    .catch((err) => {
                        console.log("err in axios post comment: ", err);
                    });
            },
        },
    });

    new Vue({
        el: "#main",
        data: {
            images: [],
            id: location.hash.slice(1),
            title: "",
            description: "",
            username: "",
            file: null,
            seen: true,
        },
        mounted: function () {
            var thisData = this;
            axios
                .get("/images")
                .then(function (res) {
                    thisData.images = res.data.reverse();
                })
                .catch(function (err) {
                    console.log(err);
                });
            window.addEventListener("hashchange", function () {
                console.log("hash change has fired");
                console.log(location.hash);
                self.id = location.hash.slice(1);
            });
        },
        methods: {
            handleChange: function (e) {
                this.file = e.target.files[0];
            },
            handleClick: function (e) {
                e.preventDefault();
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("artist", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var thisData = this;
                axios
                    .post("/upload", formData)
                    .then(function (res) {
                        thisData.images.unshift(res.data[0]);
                        thisData.title = thisData.description = thisData.username =
                            "";
                        thisData.file = null;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            getMoreImages: function (e) {
                e.preventDefault();
                var thisData = this;
                var arr = [];
                for (var i = 0; i < thisData.images.length; i++) {
                    arr.push(thisData.images[i].id);
                }
                var lastId = Math.min(...arr);
                axios
                    .get("/getMoreImages/" + lastId)
                    .then((res) => {
                        console.log("res in getMoreImage: ", res.data);
                        console.log(
                            "thisData.images in getMoreImage: ",
                            thisData.images
                        );
                        thisData.images.push(...res.data);
                        if (res.data[res.data.length - 1].id === 1) {
                            thisData.seen = false;
                        }
                    })
                    .catch((err) => {
                        console.log("err in get more images: ", err);
                    });
            },
            closeModal: function () {
                this.id = null;
                location.hash = "";
            },
            // openModal: function (e) {
            //     var thisData = this;
            //     thisData.id = thisData.images.id;
            // },
            showImageHighlight: function (image) {
                this.id = image;
            },
        },
    });
})();
