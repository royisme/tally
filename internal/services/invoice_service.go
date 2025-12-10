package services

import (
	"database/sql"
	"encoding/json"
	"freelance-flow/internal/dto"
	"freelance-flow/internal/mapper"
	"freelance-flow/internal/models"
	"log"
)

// InvoiceService handles all invoice-related operations.
type InvoiceService struct {
	db *sql.DB
}

// NewInvoiceService creates a new InvoiceService instance.
func NewInvoiceService(db *sql.DB) *InvoiceService {
	return &InvoiceService{db: db}
}

// List returns all invoices as DTOs.
func (s *InvoiceService) List() []dto.InvoiceOutput {
	rows, err := s.db.Query("SELECT id, client_id, number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, items_json FROM invoices")
	if err != nil {
		log.Println("Error querying invoices:", err)
		return []dto.InvoiceOutput{}
	}
	defer rows.Close()

	var invoices []models.Invoice
	for rows.Next() {
		var i models.Invoice
		var itemsJSON string
		err := rows.Scan(&i.ID, &i.ClientID, &i.Number, &i.IssueDate, &i.DueDate, &i.Subtotal, &i.TaxRate, &i.TaxAmount, &i.Total, &i.Status, &itemsJSON)
		if err != nil {
			log.Println("Error scanning invoice:", err)
			continue
		}
		if itemsJSON != "" {
			json.Unmarshal([]byte(itemsJSON), &i.Items)
		} else {
			i.Items = []models.InvoiceItem{}
		}
		invoices = append(invoices, i)
	}
	return mapper.ToInvoiceOutputList(invoices)
}

// Get returns a single invoice by ID.
func (s *InvoiceService) Get(id int) (dto.InvoiceOutput, error) {
	row := s.db.QueryRow("SELECT id, client_id, number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, items_json FROM invoices WHERE id = ?", id)
	var i models.Invoice
	var itemsJSON string
	err := row.Scan(&i.ID, &i.ClientID, &i.Number, &i.IssueDate, &i.DueDate, &i.Subtotal, &i.TaxRate, &i.TaxAmount, &i.Total, &i.Status, &itemsJSON)
	if err != nil {
		return dto.InvoiceOutput{}, err
	}
	if itemsJSON != "" {
		json.Unmarshal([]byte(itemsJSON), &i.Items)
	} else {
		i.Items = []models.InvoiceItem{}
	}
	return mapper.ToInvoiceOutput(i), nil
}

// Create adds a new invoice and returns the created invoice as DTO.
func (s *InvoiceService) Create(input dto.CreateInvoiceInput) dto.InvoiceOutput {
	entity := mapper.ToInvoiceEntity(input)
	itemsBytes, _ := json.Marshal(entity.Items)
	itemsJSON := string(itemsBytes)

	stmt, err := s.db.Prepare("INSERT INTO invoices(client_id, number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, items_json) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println("Error preparing invoice insert:", err)
		return dto.InvoiceOutput{}
	}
	defer stmt.Close()

	res, err := stmt.Exec(entity.ClientID, entity.Number, entity.IssueDate, entity.DueDate, entity.Subtotal, entity.TaxRate, entity.TaxAmount, entity.Total, entity.Status, itemsJSON)
	if err != nil {
		log.Println("Error inserting invoice:", err)
		return dto.InvoiceOutput{}
	}

	id, _ := res.LastInsertId()
	entity.ID = int(id)
	return mapper.ToInvoiceOutput(entity)
}

// Update modifies an existing invoice and returns the updated invoice as DTO.
func (s *InvoiceService) Update(input dto.UpdateInvoiceInput) dto.InvoiceOutput {
	// Convert items to JSON
	items := mapper.ToInvoiceItemEntityList(input.Items)
	itemsBytes, _ := json.Marshal(items)
	itemsJSON := string(itemsBytes)

	stmt, err := s.db.Prepare("UPDATE invoices SET client_id=?, number=?, issue_date=?, due_date=?, subtotal=?, tax_rate=?, tax_amount=?, total=?, status=?, items_json=? WHERE id=?")
	if err != nil {
		log.Println("Error preparing invoice update:", err)
		return dto.InvoiceOutput{}
	}
	defer stmt.Close()

	_, err = stmt.Exec(input.ClientID, input.Number, input.IssueDate, input.DueDate, input.Subtotal, input.TaxRate, input.TaxAmount, input.Total, input.Status, itemsJSON, input.ID)
	if err != nil {
		log.Println("Error updating invoice:", err)
		return dto.InvoiceOutput{}
	}

	output, _ := s.Get(input.ID)
	return output
}

// Delete removes an invoice by ID.
func (s *InvoiceService) Delete(id int) {
	_, err := s.db.Exec("DELETE FROM invoices WHERE id=?", id)
	if err != nil {
		log.Println("Error deleting invoice:", err)
	}
}

// GeneratePDF is a placeholder for PDF generation.
func (s *InvoiceService) GeneratePDF(id int) string {
	return "mock-pdf-base64-from-backend"
}

// SendEmail is a placeholder for email sending.
func (s *InvoiceService) SendEmail(id int) bool {
	return true
}
