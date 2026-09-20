package setting

import (
	"slices"
	"sync"

	"github.com/QuantumNous/new-api/common"
)

// groupOrder is the display order of groups, edited in the admin group pricing page.
// It is presentational only: it never affects billing, the default group, or the
// auto group routing priority, which is governed by autoGroups.
var groupOrder = []string{}
var groupOrderMutex sync.RWMutex

func GetGroupOrder() []string {
	groupOrderMutex.RLock()
	defer groupOrderMutex.RUnlock()

	return slices.Clone(groupOrder)
}

func GroupOrder2JSONString() string {
	groupOrderMutex.RLock()
	defer groupOrderMutex.RUnlock()

	// The frontend validates this field as a JSON array of group names, so it must
	// never serialize to null: a nil slice (never configured, or a literal "null"
	// stored earlier) would make saving the group pricing page fail silently.
	if groupOrder == nil {
		return "[]"
	}

	jsonBytes, err := common.Marshal(groupOrder)
	if err != nil {
		common.SysLog("error marshalling group order: " + err.Error())
		return "[]"
	}
	return string(jsonBytes)
}

func UpdateGroupOrderByJSONString(jsonString string) error {
	var order []string
	if err := common.Unmarshal([]byte(jsonString), &order); err != nil {
		return err
	}

	groupOrderMutex.Lock()
	defer groupOrderMutex.Unlock()
	groupOrder = order
	return nil
}

// SortGroupsByDisplayOrder orders the given group names by the configured display
// order. Names the order does not mention keep their relative order and follow the
// mentioned ones.
func SortGroupsByDisplayOrder(groupNames []string) []string {
	order := GetGroupOrder()
	if len(order) == 0 || len(groupNames) == 0 {
		return groupNames
	}

	// A name the order repeats keeps its first position. A name the order does not
	// mention ranks past every configured position, so the stable sort leaves it where
	// it was, behind the mentioned ones.
	rank := make(map[string]int, len(order))
	for index, name := range order {
		if _, ok := rank[name]; !ok {
			rank[name] = index
		}
	}
	positionOf := func(name string) int {
		if position, ok := rank[name]; ok {
			return position
		}
		return len(order)
	}

	sorted := slices.Clone(groupNames)
	slices.SortStableFunc(sorted, func(a, b string) int { return positionOf(a) - positionOf(b) })
	return sorted
}
