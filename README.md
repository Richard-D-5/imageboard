# Imageboard

### Description 

This was the first SPA (Single Page Application) I made using a JavaScript framework: Vue.js. The project is an online image board where users can post and comment on images of dog puppies.

### Tehnology

* Node/Express server
* Vue.js front-end framework
* PostgreSQL database
* Files uploaded to AWS

### Features

**Main component**

* The main instance shows the seven most recently posted images, along with the name of the puppy, rendered in a CSS grid
* Older images are fetched when the more is clicked, seven at a time
* Users upload a file from their computer and can must provide the name of the puppy and their username  

**Modal component**

* When an image is clicked, a modal component is mounted, showing the image along with further details, including the name of the user who posted it, and
* Users can comment on an image and read comments posted by other users
* Each image has its own hash route
* Closing the modal returns the user to the main instance

### Preview


