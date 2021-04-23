FROM node:12.2.0 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@10.1.1

# add app
COPY . /app

# generate build
RUN ng build --output-path=dist

### Production Release ###

# base image
FROM nginx:1.16.0-alpine

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html

# expose port 80 to view page. Port 1617 is used internally
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]