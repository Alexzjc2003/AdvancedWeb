FROM node:18 AS build

WORKDIR /app

COPY . .

RUN npm install -g @angular/cli && npm install

RUN ng build --configuration production


FROM nginx:latest

# COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist/subjectThree/browser/. /usr/share/nginx/html/

EXPOSE 80

# CMD ["sh", "-c", "ng serve"]
CMD ["nginx", "-g", "daemon off;"]