import pygame, random, time
from pygame.locals import *

# VARIABLES
SCREEN_WIDHT = 400
SCREEN_HEIGHT = 600
SPEED = 20
GRAVITY = 2.5
GAME_SPEED = 15

GROUND_WIDHT = 2 * SCREEN_WIDHT
GROUND_HEIGHT= 100

PIPE_WIDHT = 80
PIPE_HEIGHT = 500

PIPE_GAP = 150
wing = 'assets/audio/wing.wav'
hit = 'assets/audio/hit.wav'

pygame.mixer.init()
pygame.font.init()
FONT = pygame.font.Font(None, 36)

class Bird(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.images =  [
            pygame.image.load('assets/sprites/bluebird-upflap.png').convert_alpha(),
            pygame.image.load('assets/sprites/bluebird-midflap.png').convert_alpha(),
            pygame.image.load('assets/sprites/bluebird-downflap.png').convert_alpha()
        ]
        self.speed = SPEED
        self.current_image = 0
        self.image = self.images[0]
        self.mask = pygame.mask.from_surface(self.image)
        self.rect = self.image.get_rect()
        self.rect[0] = SCREEN_WIDHT / 6
        self.rect[1] = SCREEN_HEIGHT / 2

    def update(self):
        self.current_image = (self.current_image + 1) % 3
        self.image = self.images[self.current_image]
        self.speed += GRAVITY
        self.rect[1] += self.speed

    def bump(self):
        self.speed = -SPEED

    def begin(self):
        self.current_image = (self.current_image + 1) % 3
        self.image = self.images[self.current_image]

class Pipe(pygame.sprite.Sprite):
    def __init__(self, inverted, xpos, ysize):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.image.load('assets/sprites/pipe-green.png').convert_alpha()
        self.image = pygame.transform.scale(self.image, (PIPE_WIDHT, PIPE_HEIGHT))
        self.rect = self.image.get_rect()
        self.rect[0] = xpos
        if inverted:
            self.image = pygame.transform.flip(self.image, False, True)
            self.rect[1] = - (self.rect[3] - ysize)
        else:
            self.rect[1] = SCREEN_HEIGHT - ysize
        self.mask = pygame.mask.from_surface(self.image)

    def update(self):
        self.rect[0] -= GAME_SPEED

class Ground(pygame.sprite.Sprite):
    def __init__(self, xpos):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.image.load('assets/sprites/base.png').convert_alpha()
        self.image = pygame.transform.scale(self.image, (GROUND_WIDHT, GROUND_HEIGHT))
        self.mask = pygame.mask.from_surface(self.image)
        self.rect = self.image.get_rect()
        self.rect[0] = xpos
        self.rect[1] = SCREEN_HEIGHT - GROUND_HEIGHT

    def update(self):
        self.rect[0] -= GAME_SPEED

def is_off_screen(sprite):
    return sprite.rect[0] < -(sprite.rect[2])

def get_random_pipes(xpos):
    size = random.randint(100, 300)
    pipe = Pipe(False, xpos, size)
    pipe_inverted = Pipe(True, xpos, SCREEN_HEIGHT - size - PIPE_GAP)
    return pipe, pipe_inverted

def render_score(screen, score):
    score_text = FONT.render(f'Score: {score}', True, (255, 255, 255))
    screen.blit(score_text, (10, 10))

def check_score(bird, pipe_group, passed_pipes):
    global score
    for pipe in pipe_group:
        if pipe.rect.y > 0 and pipe.rect.right < bird.rect.left and pipe not in passed_pipes:
            score += 1
            passed_pipes.add(pipe)
    return score, passed_pipes

def reset_game():
    global bird, bird_group, pipe_group, ground_group, passed_pipes, score
    bird = Bird()
    bird_group = pygame.sprite.Group(bird)
    ground_group = pygame.sprite.Group()
    for i in range(2):
        ground = Ground(GROUND_WIDHT * i)
        ground_group.add(ground)
    pipe_group = pygame.sprite.Group()
    for i in range(2):
        pipes = get_random_pipes(SCREEN_WIDHT * i + 800)
        pipe_group.add(pipes[0])
        pipe_group.add(pipes[1])
    passed_pipes = set()
    score = 0
    return bird, bird_group, pipe_group, ground_group, passed_pipes, score

# === MAIN GAME LOOP ===
def play_flappy_bird():
    pygame.init()
    pygame.display.set_caption('Flappy Bird')
    screen = pygame.display.set_mode((SCREEN_WIDHT, SCREEN_HEIGHT))
    BACKGROUND = pygame.image.load('assets/sprites/background-day.png')
    BACKGROUND = pygame.transform.scale(BACKGROUND, (SCREEN_WIDHT, SCREEN_HEIGHT))
    BEGIN_IMAGE = pygame.image.load('assets/sprites/message.png').convert_alpha()
    game_completed = False
    clock = pygame.time.Clock()
    global passed_pipes
    while not game_completed:
        reset_game()
        begin = True
        while begin:
            clock.tick(15)
            for event in pygame.event.get():
                if event.type == QUIT:
                    pygame.quit()
                    exit()
                if event.type == KEYDOWN and (event.key == K_SPACE or event.key == K_UP):
                    bird.bump()
                    pygame.mixer.music.load(wing)
                    pygame.mixer.music.play()
                    begin = False

            screen.blit(BACKGROUND, (0, 0))
            screen.blit(BEGIN_IMAGE, (120, 150))

            if is_off_screen(ground_group.sprites()[0]):
                ground_group.remove(ground_group.sprites()[0])
                ground_group.add(Ground(GROUND_WIDHT - 20))

            bird.begin()
            ground_group.update()
            bird_group.draw(screen)
            ground_group.draw(screen)
            pygame.display.update()

        alive = True
        while alive:
            clock.tick(15)
            for event in pygame.event.get():
                if event.type == QUIT:
                    pygame.quit()
                    exit()
                if event.type == KEYDOWN and (event.key == K_SPACE or event.key == K_UP):
                    bird.bump()
                    pygame.mixer.music.load(wing)
                    pygame.mixer.music.play()

            screen.blit(BACKGROUND, (0, 0))

            if is_off_screen(ground_group.sprites()[0]):
                ground_group.remove(ground_group.sprites()[0])
                ground_group.add(Ground(GROUND_WIDHT - 20))

            if is_off_screen(pipe_group.sprites()[0]):
                pipe_group.remove(pipe_group.sprites()[0])
                pipe_group.remove(pipe_group.sprites()[0])
                pipes = get_random_pipes(SCREEN_WIDHT * 2)
                pipe_group.add(pipes[0])
                pipe_group.add(pipes[1])

            bird_group.update()
            ground_group.update()
            pipe_group.update()

            score, passed_pipes = check_score(bird, pipe_group, passed_pipes)
            if score >= 3:
                # Show congrats message
                screen.fill((0, 0, 0))
                congrats_font = pygame.font.Font(None, 48)
                text = congrats_font.render("You've made it", True, (255, 255, 0))
                text_rect = text.get_rect(center=(SCREEN_WIDHT // 2, SCREEN_HEIGHT // 2))
                screen.blit(text, text_rect)
                pygame.display.update()
                time.sleep(3)
                pygame.quit()
                exit()

            bird_group.draw(screen)
            pipe_group.draw(screen)
            ground_group.draw(screen)
            render_score(screen, score)
            pygame.display.update()

            if (pygame.sprite.groupcollide(bird_group, ground_group, False, False, pygame.sprite.collide_mask) or
                    pygame.sprite.groupcollide(bird_group, pipe_group, False, False, pygame.sprite.collide_mask)):
                pygame.mixer.music.load(hit)
                pygame.mixer.music.play()
                time.sleep(1)
                alive = False

        if score >= 3:
            game_completed = True
        else:
            print(f"Try again! Score was: {score}")

def main():
    play_flappy_bird()

if __name__ == "__main__":
    main()