package service

import (
	"context"

	"github.com/khala-matrix/backend/internal/model"
	"github.com/khala-matrix/backend/internal/store"
)

type OfficeService struct {
	store *store.Store
}

func NewOfficeService(s *store.Store) *OfficeService {
	return &OfficeService{store: s}
}

func (s *OfficeService) GetAgentsSnapshot(ctx context.Context) (*model.OfficeSnapshot, error) {
	return s.store.GetOfficeSnapshot(ctx)
}
