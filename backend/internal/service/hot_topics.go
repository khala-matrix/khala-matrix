package service

import (
	"context"

	"github.com/khala-matrix/backend/internal/model"
	"github.com/khala-matrix/backend/internal/store"
)

type HotTopicsService struct {
	store *store.Store
}

func NewHotTopicsService(s *store.Store) *HotTopicsService {
	return &HotTopicsService{store: s}
}

func (s *HotTopicsService) GetPageData(ctx context.Context) (*model.HotTopicsPageData, error) {
	return s.store.GetHotTopicsPageData(ctx)
}
