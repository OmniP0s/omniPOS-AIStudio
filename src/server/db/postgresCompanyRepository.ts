/**
 * Postgres Company Repository - Adapter (Infrastructure)
 * يطبق ICompanyRepository من Domain
 */

import type { Company, CompanyId, OrganizationId } from '../../domain/company/companyEntity'
import type { ICompanyRepository, CompanyFilter, CompanySummary } from '../../domain/company/companyRepository'
import { getPool } from './connection'

export class PostgresCompanyRepository implements ICompanyRepository {
  private get db() {
    return getPool()
  }

  async findById(tenantId: OrganizationId, companyId: CompanyId): Promise<Company | null> {
    const result = await this.db.query(
      `SELECT * FROM companies WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [companyId, tenantId]
    )
    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findByCode(tenantId: OrganizationId, code: string): Promise<Company | null> {
    const result = await this.db.query(
      `SELECT * FROM companies WHERE tenant_id = $1 AND code = $2 LIMIT 1`,
      [tenantId, code.toUpperCase()]
    )
    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findByVat(tenantId: OrganizationId, vatNumber: string): Promise<Company | null> {
    const result = await this.db.query(
      `SELECT * FROM companies WHERE tenant_id = $1 AND vat_number = $2 LIMIT 1`,
      [tenantId, vatNumber]
    )
    return result.rows[0] ? this.mapRow(result.rows[0]) : null
  }

  async findMany(filter: CompanyFilter): Promise<Company[]> {
    let query = `SELECT * FROM companies WHERE tenant_id = $1`
    const params: any[] = [filter.tenantId]
    let idx = 2

    if (filter.isActive !== undefined) {
      query += ` AND is_active = $${idx++}`
      params.push(filter.isActive)
    }

    if (filter.search) {
      query += ` AND (name_en ILIKE $${idx} OR name_ar ILIKE $${idx} OR code ILIKE $${idx} OR vat_number ILIKE $${idx})`
      params.push(`%${filter.search}%`)
      idx++
    }

    query += ` ORDER BY created_at DESC`

    const result = await this.db.query(query, params)
    return result.rows.map(r => this.mapRow(r))
  }

  async findSummaries(tenantId: OrganizationId): Promise<CompanySummary[]> {
    // Join with branches + orders for aggregates
    const result = await this.db.query(
      `
      SELECT 
        c.id as company_id,
        c.code,
        c.name_en,
        c.name_ar,
        c.vat_number,
        c.currency,
        c.is_active,
        COUNT(DISTINCT b.id) as branches_count,
        COUNT(DISTINCT t.id) as terminals_count,
        COALESCE(SUM(o.total_minor), 0) as total_sales_minor
      FROM companies c
      LEFT JOIN branches b ON b.company_id = c.id AND b.tenant_id = c.tenant_id
      LEFT JOIN terminals t ON t.company_id = c.id AND t.tenant_id = c.tenant_id
      LEFT JOIN orders o ON o.company_id = c.id AND o.tenant_id = c.tenant_id 
        AND o.created_at >= date_trunc('month', NOW())
        AND o.status != 'CANCELLED'
      WHERE c.tenant_id = $1
      GROUP BY c.id, c.code, c.name_en, c.name_ar, c.vat_number, c.currency, c.is_active
      ORDER BY c.created_at DESC
      `,
      [tenantId]
    )

    return result.rows.map(r => ({
      companyId: r.company_id,
      code: r.code,
      nameEn: r.name_en,
      nameAr: r.name_ar,
      vatNumber: r.vat_number,
      branchesCount: parseInt(r.branches_count, 10),
      terminalsCount: parseInt(r.terminals_count, 10),
      totalSalesThisMonthMinor: BigInt(r.total_sales_minor),
      currency: r.currency,
      isActive: r.is_active,
    }))
  }

  async save(company: Company): Promise<Company> {
    const result = await this.db.query(
      `
      INSERT INTO companies (id, tenant_id, code, name_en, name_ar, legal_name_en, legal_name_ar, vat_number, cr_number, currency, country, logo_url, config, is_active, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (id) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        legal_name_en = EXCLUDED.legal_name_en,
        legal_name_ar = EXCLUDED.legal_name_ar,
        config = EXCLUDED.config,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
      RETURNING *
      `,
      [
        company.id,
        company.tenantId,
        company.code,
        company.nameEn,
        company.nameAr,
        (company as any).legalNameEn || null,
        (company as any).legalNameAr || null,
        company.vatNumber,
        company.crNumber,
        company.currency,
        company.country,
        (company as any).logoUrl || null,
        JSON.stringify(company.config),
        company.isActive,
        company.createdAt,
        company.updatedAt,
      ]
    )
    return this.mapRow(result.rows[0])
  }

  async deactivate(tenantId: OrganizationId, companyId: CompanyId): Promise<void> {
    await this.db.query(
      `UPDATE companies SET is_active = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [companyId, tenantId]
    )
  }

  async countBranches(tenantId: OrganizationId, companyId: CompanyId): Promise<number> {
    const result = await this.db.query(
      `SELECT COUNT(*) as cnt FROM branches WHERE tenant_id = $1 AND company_id = $2 AND is_active = true`,
      [tenantId, companyId]
    )
    return parseInt(result.rows[0].cnt, 10)
  }

  private mapRow(row: any): Company {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      code: row.code,
      nameEn: row.name_en,
      nameAr: row.name_ar,
      legalNameEn: row.legal_name_en,
      legalNameAr: row.legal_name_ar,
      vatNumber: row.vat_number,
      crNumber: row.cr_number,
      country: row.country,
      currency: row.currency,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      isActive: row.is_active,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    }
  }
}
