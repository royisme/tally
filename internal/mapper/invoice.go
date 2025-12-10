package mapper

import (
	"freelance-flow/internal/dto"
	"freelance-flow/internal/models"
)

// ToInvoiceItemOutput converts an InvoiceItem entity to InvoiceItemOutput DTO.
func ToInvoiceItemOutput(e models.InvoiceItem) dto.InvoiceItemOutput {
	return dto.InvoiceItemOutput{
		ID:          e.ID,
		Description: e.Description,
		Quantity:    e.Quantity,
		UnitPrice:   e.UnitPrice,
		Amount:      e.Amount,
	}
}

// ToInvoiceItemOutputList converts a slice of InvoiceItem entities to InvoiceItemOutput DTOs.
func ToInvoiceItemOutputList(entities []models.InvoiceItem) []dto.InvoiceItemOutput {
	if entities == nil {
		return []dto.InvoiceItemOutput{}
	}
	result := make([]dto.InvoiceItemOutput, len(entities))
	for i, e := range entities {
		result[i] = ToInvoiceItemOutput(e)
	}
	return result
}

// ToInvoiceOutput converts an Invoice entity to InvoiceOutput DTO.
func ToInvoiceOutput(e models.Invoice) dto.InvoiceOutput {
	return dto.InvoiceOutput{
		ID:        e.ID,
		ClientID:  e.ClientID,
		Number:    e.Number,
		IssueDate: e.IssueDate,
		DueDate:   e.DueDate,
		Subtotal:  e.Subtotal,
		TaxRate:   e.TaxRate,
		TaxAmount: e.TaxAmount,
		Total:     e.Total,
		Status:    e.Status,
		Items:     ToInvoiceItemOutputList(e.Items),
	}
}

// ToInvoiceOutputList converts a slice of Invoice entities to InvoiceOutput DTOs.
func ToInvoiceOutputList(entities []models.Invoice) []dto.InvoiceOutput {
	if entities == nil {
		return []dto.InvoiceOutput{}
	}
	result := make([]dto.InvoiceOutput, len(entities))
	for i, e := range entities {
		result[i] = ToInvoiceOutput(e)
	}
	return result
}

// ToInvoiceItemEntity converts InvoiceItemInput DTO to InvoiceItem entity.
func ToInvoiceItemEntity(input dto.InvoiceItemInput) models.InvoiceItem {
	return models.InvoiceItem{
		Description: input.Description,
		Quantity:    input.Quantity,
		UnitPrice:   input.UnitPrice,
		Amount:      input.Amount,
	}
}

// ToInvoiceItemEntityList converts a slice of InvoiceItemInput DTOs to InvoiceItem entities.
func ToInvoiceItemEntityList(inputs []dto.InvoiceItemInput) []models.InvoiceItem {
	if inputs == nil {
		return []models.InvoiceItem{}
	}
	result := make([]models.InvoiceItem, len(inputs))
	for i, input := range inputs {
		result[i] = ToInvoiceItemEntity(input)
	}
	return result
}

// ToInvoiceEntity converts CreateInvoiceInput DTO to Invoice entity.
func ToInvoiceEntity(input dto.CreateInvoiceInput) models.Invoice {
	return models.Invoice{
		ClientID:  input.ClientID,
		Number:    input.Number,
		IssueDate: input.IssueDate,
		DueDate:   input.DueDate,
		Subtotal:  input.Subtotal,
		TaxRate:   input.TaxRate,
		TaxAmount: input.TaxAmount,
		Total:     input.Total,
		Status:    input.Status,
		Items:     ToInvoiceItemEntityList(input.Items),
	}
}

// ApplyInvoiceUpdate applies UpdateInvoiceInput to an existing Invoice entity.
func ApplyInvoiceUpdate(e *models.Invoice, input dto.UpdateInvoiceInput) {
	e.ClientID = input.ClientID
	e.Number = input.Number
	e.IssueDate = input.IssueDate
	e.DueDate = input.DueDate
	e.Subtotal = input.Subtotal
	e.TaxRate = input.TaxRate
	e.TaxAmount = input.TaxAmount
	e.Total = input.Total
	e.Status = input.Status
	e.Items = ToInvoiceItemEntityList(input.Items)
}
