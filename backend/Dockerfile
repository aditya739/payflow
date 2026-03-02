# Build stage
FROM golang:alpine AS builder

WORKDIR /app

# Install dependencies, required for some CGO builds if any, but disabled here.
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o payflow-api .

# Run stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/payflow-api .

EXPOSE 8080

CMD ["./payflow-api"]
