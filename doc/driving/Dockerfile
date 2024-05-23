FROM golang:1.22-alpine as builder

WORKDIR /app

copy go.mod go.sum ./
RUN apk add --no-cache gcc\
    g++ && \
    go mod download

COPY . .

RUN go build -o driving

FROM alpine

WORKDIR /app

COPY --from=builder /app/driving .

# ENV DB_URL root:root@tcp(host.docker.internal:3306)/advanced_web?charset=utf8mb4&parseTime=True&loc=Local
ENV TZ=Asia/Shanghai

EXPOSE 3000

ENTRYPOINT ["./driving"]