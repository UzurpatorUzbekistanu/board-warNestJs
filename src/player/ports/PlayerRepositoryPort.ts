import { Player } from '../domain/player'; // model gracza

export interface PlayerRepositoryPort {
  create(player: Player); // utworz gracza
  findbyID(id: number); // znajdz po id
  findByName(name: string); // znajdz po nazwie
  findAll(); // lista graczy
  update(id: number, name: string, color: string); // aktualizuj dane gracza
}
