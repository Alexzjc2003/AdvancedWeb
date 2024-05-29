# FROM node:18 AS build

# WORKDIR /app

# COPY . .

# RUN npm install -g @angular/cli && npm install

# RUN ng build --configuration production


# FROM nginx:latest

# # COPY nginx.conf /etc/nginx/nginx.conf

# COPY --from=build /app/dist/subjectThree/browser/. /usr/share/nginx/html/

# EXPOSE 80

# # CMD ["sh", "-c", "ng serve"]
# CMD ["nginx", "-g", "daemon off;"]

FROM node:18 
WORKDIR /app
COPY . . 
RUN npm install --legacy-peer-deps 
RUN npm install -g @angular/cli 
ENV NODE_OPTIONS --openssl-legacy-provider 
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"] 