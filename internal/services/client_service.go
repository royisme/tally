package services

import (
	"database/sql"
	"freelance-flow/internal/dto"
	"freelance-flow/internal/mapper"
	"freelance-flow/internal/models"
	"log"
)

// ClientService handles all client-related operations.
type ClientService struct {
	db *sql.DB
}

// NewClientService creates a new ClientService instance.
func NewClientService(db *sql.DB) *ClientService {
	return &ClientService{db: db}
}

// List returns all clients as DTOs.
func (s *ClientService) List() []dto.ClientOutput {
	rows, err := s.db.Query("SELECT id, name, email, website, avatar, contact_person, address, currency, status, notes FROM clients")
	if err != nil {
		log.Println("Error querying clients:", err)
		return []dto.ClientOutput{}
	}
	defer rows.Close()

	var clients []models.Client
	for rows.Next() {
		var c models.Client
		err := rows.Scan(&c.ID, &c.Name, &c.Email, &c.Website, &c.Avatar, &c.ContactPerson, &c.Address, &c.Currency, &c.Status, &c.Notes)
		if err != nil {
			log.Println("Error scanning client:", err)
			continue
		}
		clients = append(clients, c)
	}
	return mapper.ToClientOutputList(clients)
}

// Get returns a single client by ID.
func (s *ClientService) Get(id int) (dto.ClientOutput, error) {
	row := s.db.QueryRow("SELECT id, name, email, website, avatar, contact_person, address, currency, status, notes FROM clients WHERE id = ?", id)
	var c models.Client
	err := row.Scan(&c.ID, &c.Name, &c.Email, &c.Website, &c.Avatar, &c.ContactPerson, &c.Address, &c.Currency, &c.Status, &c.Notes)
	if err != nil {
		return dto.ClientOutput{}, err
	}
	return mapper.ToClientOutput(c), nil
}

// Create adds a new client and returns the created client as DTO.
func (s *ClientService) Create(input dto.CreateClientInput) dto.ClientOutput {
	entity := mapper.ToClientEntity(input)

	stmt, err := s.db.Prepare("INSERT INTO clients(name, email, website, avatar, contact_person, address, currency, status, notes) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println("Error preparing insert:", err)
		return dto.ClientOutput{}
	}
	defer stmt.Close()

	res, err := stmt.Exec(entity.Name, entity.Email, entity.Website, entity.Avatar, entity.ContactPerson, entity.Address, entity.Currency, entity.Status, entity.Notes)
	if err != nil {
		log.Println("Error inserting client:", err)
		return dto.ClientOutput{}
	}

	id, _ := res.LastInsertId()
	entity.ID = int(id)
	return mapper.ToClientOutput(entity)
}

// Update modifies an existing client and returns the updated client as DTO.
func (s *ClientService) Update(input dto.UpdateClientInput) dto.ClientOutput {
	stmt, err := s.db.Prepare("UPDATE clients SET name=?, email=?, website=?, avatar=?, contact_person=?, address=?, currency=?, status=?, notes=? WHERE id=?")
	if err != nil {
		log.Println("Error preparing update:", err)
		return dto.ClientOutput{}
	}
	defer stmt.Close()

	_, err = stmt.Exec(input.Name, input.Email, input.Website, input.Avatar, input.ContactPerson, input.Address, input.Currency, input.Status, input.Notes, input.ID)
	if err != nil {
		log.Println("Error updating client:", err)
		return dto.ClientOutput{}
	}

	// Return the updated client
	output, _ := s.Get(input.ID)
	return output
}

// Delete removes a client by ID.
func (s *ClientService) Delete(id int) {
	_, err := s.db.Exec("DELETE FROM clients WHERE id=?", id)
	if err != nil {
		log.Println("Error deleting client:", err)
	}
}
