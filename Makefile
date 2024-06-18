
all:
	docker compose -f docker-compose.yml build
	docker compose -f docker-compose.yml up -d
	
clean:
	docker compose -f docker-compose.yml down --rmi all -v

fclean: clean
	docker system prune -f

re: fclean all

up:
	docker compose -f docker-compose.yml up -d

down:
	docker compose -f docker-compose.yml down

.PHONY: all clean fclean re up down